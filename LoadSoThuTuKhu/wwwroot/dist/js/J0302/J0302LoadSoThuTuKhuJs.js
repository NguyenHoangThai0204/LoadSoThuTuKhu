// ==================== BIẾN GLOBAL ====================
let currentInterval = null;   // 👈 khai báo biến interval
let phongSelect;
let listDanToc = [];
//// ===== NÚT FULLSCREEN =====
document.addEventListener("DOMContentLoaded", () => {
    const btnFullscreen = document.getElementById("btnFullscreen");
    if (btnFullscreen) {
        btnFullscreen.addEventListener("click", () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    alert(`Không thể bật full màn hình: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });
    }
});


// ==================== ĐỌC JSON ====================
$.getJSON("dist/data/json/DM_Khu.json", dataDanToc => {

    listDanToc = dataDanToc
        .filter(n =>
            (n.active === true || n.active === 1)
        )
        .map(n => ({
            ...n,
            alias: n.viettat?.trim() !== ""
                ? n.viettat.toUpperCase()
                : n.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
        }));

    // config cho TomSelect
    const configs = [
        {
            className: ".tom-select-test",
            placeholder: "-- Phòng khám --",
            dieuKien: function (response) {
                return response.filter(x => x.id); // lọc điều kiện tuỳ ý
            }
        }
    ];

    configCb(configs, listDanToc);

    // ===== LẤY DỮ LIỆU TỪ localStorage =====
    const savedData = localStorage.getItem("selectedPhongData");
    console.log(savedData);
    if (savedData) {
        const parsed = JSON.parse(savedData);
        const savedPhongId = parsed.phongId;
        const savedIdcn = parsed.idcn;

        phongSelect.setValue(savedPhongId, true);   // set lại vào TomSelect
        const phong = listDanToc.find(p => p.id == savedPhongId);
        if (phong) {
            $("#roomName").text(phong.ten);
            if (savedIdcn) {
                loadSTT(savedPhongId, savedIdcn);
            }
        }
    }

});

// ==================== CONFIG SELECT ====================
function configCb(configs, dataSource) {
    configs.forEach(cfg => {
        let result = cfg.dieuKien ? cfg.dieuKien(dataSource) : dataSource;

        phongSelect = new TomSelect(cfg.className, {
            options: result,
            valueField: "id",
            labelField: "ten",
            searchField: ["ten", "alias"],
            placeholder: cfg.placeholder,
            maxItems: 1,
            render: {
                option: function (data, escape) {
                    return `
                        <div class="d-flex justify-content-between w-100">
                            <span>${escape(data.ten)}</span>
                            <small class="text-muted">${escape(data.viettat || "")}</small>
                        </div>`;
                },
                item: function (data, escape) {
                    return `
                        <div class="d-flex justify-content-between w-100">
                            <span>${escape(data.ten)}</span>
                            <small class="text-muted">${escape(data.viettat || "")}</small>
                        </div>`;
                }
            }
        });
    });
}

// ==================== HÀM LOAD SỐ THỨ TỰ ====================
async function loadSTT(idKhu, idChiNhanh) {
    if (!idKhu || isNaN(idKhu) || idKhu <= 0 || !idChiNhanh) {
        console.error("Tham số không hợp lệ. Dừng loadSTT.", { idKhu, idChiNhanh });
        return;
    }

    try {
        const res = await fetch(`/load_so_thu_tu_khu/filter?IdKhu=${idKhu}&IdChiNhanh=${idChiNhanh}`, {
            method: "POST"
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
        const data = json.data || [];
        const intervalTime = (json.thoiGian || 5000);

        // ===== Gom bệnh nhân theo phòng =====
        const rooms = {};
        data.forEach(item => {
            if (!rooms[item.iDPhong]) {
                rooms[item.iDPhong] = {
                    id: item.iDPhong,
                    name: item.tenPhong,
                    maPhong: item.maPhong,
                    patients: []
                };
            }
            if (item.soThuTu != null && item.trangThai !== 4) {
                rooms[item.iDPhong].patients.push({
                    stt: item.soThuTu,
                    status: item.trangThai
                });
            }
        });

        const roomList = Object.values(rooms);

        // ===== Render bảng phòng =====
        const roomContainer = document.getElementById("roomContainer");
        if (!roomContainer) return;

        const renderCol = (list) => {
            let html = `
              <table class="queue-table" style="table-layout: fixed; width:100%;">
                <thead style="background: #007acc; color: white; font-size: 1.5rem; font-weight: bold; text-align: center;">
                  <tr>
                    <th style="width:20%">PHÒNG</th>
                    <th style="width:38%">ĐANG KHÁM</th>
                    <th style="width:42%">CHUẨN BỊ</th>
                  </tr>
                </thead>
                <tbody>
            `;

            list.forEach(room => {
                if (!room.patients || room.patients.length === 0) {
                    html += `
                      <tr>
                        <td class="khu-name" style="background-color: #ECF3FB;color:#3691BA;">${room.maPhong}</td>
                        <td class="stt-kham"></td>
                        <td class="stt-chuanbi"></td>
                      </tr>
                    `;
                } else {
                    const sorted = room.patients.sort((a, b) => (a.stt ?? 9999) - (b.stt ?? 9999));
                    const top3 = sorted.slice(0, 3);

                    const dangKham = top3.find(p => p.status === 1);
                    const chuanBi = top3.filter(p => p !== dangKham).map(p => p.stt).join(", ");

                    html += `
                      <tr>
                        <td class="khu-name" style="background-color: #ECF3FB;color:#3691BA;">${room.maPhong}</td>
                        <td style="font-size:3.2rem;">${dangKham ? dangKham.stt : ""}</td>
                        <td style="font-size:3.2rem;">${chuanBi}</td>
                      </tr>
                    `;
                }
            });

            html += `</tbody></table>`;
            return html;
        };

        // ===== Chia bảng =====
        if (roomList.length < 5) {
            roomContainer.innerHTML = `<div class="queue-col" style="font-size:3.2rem;">${renderCol(roomList)}</div>`;
        } else {
            const half = Math.ceil(roomList.length / 2);
            const col1 = roomList.slice(0, half);
            const col2 = roomList.slice(half);

            roomContainer.innerHTML = `
                <div class="queue-columns">
                  <div class="queue-col" style="font-size:3.2rem;">${renderCol(col1)}</div>
                  <div class="queue-col" style="font-size:3.2rem;">${renderCol(col2)}</div>
                </div>
            `;
        }

        // ===== DANH SÁCH QUA LƯỢT (status = 4) =====
        const quaLuotContainer = document.getElementById("quaLuotList");
        if (quaLuotContainer) {
            quaLuotContainer.innerHTML = "";
            const quaLuotData = data.filter(item => item.trangThai === 4);

            if (quaLuotData.length) {
                quaLuotData.forEach(item => {
                    const pill = document.createElement("div");
                    pill.className = "ticker-item";
                    pill.innerHTML = `
                        <span class="room-badge">${item.maPhong}</span>
                        STT ${item.soThuTu}`;
                    quaLuotContainer.appendChild(pill);
                });
            }
        }

        // ===== Refresh =====
        if (currentInterval) clearTimeout(currentInterval);
        currentInterval = setTimeout(() => loadSTT(idKhu, idChiNhanh), intervalTime);

    } catch (err) {
        console.error("Lỗi load STT:", err);
        if (currentInterval) clearTimeout(currentInterval);
        currentInterval = setTimeout(() => loadSTT(idKhu, idChiNhanh), 5000);
    }
}

// ==================== NÚT LƯU ====================
$("#saveRoomBtn").on("click", function () {
    const phongId = phongSelect.getValue();   // 👈 Lấy value từ TomSelect
    const phong = listDanToc.find(p => p.id == phongId);

    if (phong) {
        $("#roomName").text(phong.ten);

        // Lưu cả phòng và idcn vào localStorage
        const saveData = {
            phongId: phong.id,
            idcn: window._idcn
        };
        localStorage.setItem("selectedPhongData", JSON.stringify(saveData));

        console.log("Đã lưu localStorage.selectedPhongData =", saveData);

        if (currentInterval) {
            clearTimeout(currentInterval);
            currentInterval = null;
        }
        if (phongId && window._idcn) {
            loadSTT(phongId, window._idcn);
        }
    } else {
        console.warn("Chưa chọn khu, không lưu localStorage.");
    }

    // ===== TẮT MODAL =====
    const modalEl = document.getElementById("settingsModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();
});
