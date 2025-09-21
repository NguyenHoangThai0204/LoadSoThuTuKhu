

// ===== BIẾN TOÀN CỤC =====
let currentInterval = null;

// ===== HÀM LOAD SỐ THỨ TỰ =====
//async function loadSTT(idKhu, idChiNhanh) {
//    if (!idKhu || isNaN(idKhu) || idKhu <= 0 || !idChiNhanh) {
//        console.error("Tham số không hợp lệ. Dừng loadSTT.", { idKhu, idChiNhanh });
//        return;
//    }

//    try {
//        const res = await fetch(`/load_so_thu_tu_khu/filter?IdKhu=${idKhu}&IdChiNhanh=${idChiNhanh}`, {
//            method: "POST"
//        });

//        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//        const json = await res.json();
//        const data = json.data || [];

//        const intervalTime = (json.thoiGian || 5000);

//        // ===== NHÓM THEO PHÒNG =====
//        const rooms = {};
//        data.forEach(item => {
//            if (!rooms[item.iDPhong]) {
//                rooms[item.iDPhong] = {
//                    id: item.iDPhong,
//                    name: item.tenPhong,
//                    patients: []
//                };
//            }
//            rooms[item.iDPhong].patients.push({
//                stt: item.soThuTu,
//                name: item.tenBN,
//                status: item.trangThai,
//                soLanGoi: item.soLanGoi || 0
//            });
//        });

//        const roomList = Object.values(rooms);
//        const roomCount = roomList.length;

//        // Sort bệnh nhân trong phòng
//        roomList.forEach(room => {
//            room.patients.sort((a, b) => (a.stt ?? 9999) - (b.stt ?? 9999));
//        });

//        // ===== TẠO HTML =====
//        const roomContainer = document.getElementById("roomContainer");
//        if (!roomContainer) return;

//        let roomHtml = '';
//        roomList.forEach(room => {
//            let limit = roomCount <= 2 ? 5 : 3;
//            const displayedPatients = room.patients.filter(
//                p => p.status !== 4 && p.stt != null && p.stt > 0
//            );

//            // xác định class width
//            let cardClass = "room-card";
//            if (roomCount === 1) cardClass += " full-width";
//            else if (roomCount === 2) cardClass += " half-width";
//            else cardClass += " auto-width";

//            roomHtml += `
//                <div class="${cardClass}">
//                   <div class="room-title" style="font-size: 2rem;">${room.name.toUpperCase()}</div>
//                    <table class="patient-list">
//                        <tr><th>STT</th><th>TÊN BỆNH NHÂN</th><th>TRẠNG THÁI</th></tr>`;

//            // Nếu không có bệnh nhân
//            if (displayedPatients.length === 0) {
//                roomHtml += `<tr><td colspan="3" class="no-patient-cell">Không có bệnh nhân</td></tr>`;
//            } else {
//                // Hiển thị đủ số dòng cố định (limit)
//                for (let i = 0; i < limit; i++) {
//                    if (i < displayedPatients.length) {
//                        const patient = displayedPatients[i];
//                        let statusClass = "", statusText = "";
//                        if (patient.status === 1) {
//                            statusClass = "status-invite"; statusText = "Đang mời";
//                        } else if (patient.status === 2) {
//                            statusClass = "status-wait"; statusText = "Chuẩn bị";
//                        } else if (patient.status === 3) {
//                            statusClass = "status-empty"; statusText = "Chờ tới lượt";
//                        }
//                        roomHtml += `<tr>
//                            <td>${patient.stt ?? ""}</td>
//                            <td>${patient.name ?? ""}</td>
//                            <td class="${statusClass}">${statusText}</td>
//                        </tr>`;
//                    } else {
//                        // Thêm dòng trống để giữ chiều cao cố định
//                        //roomHtml += `<tr><td>&nbsp;</td><td></td><td></td></tr>`;
//                        roomHtml += `<tr class="empty-row"><td>&nbsp;</td><td></td><td></td></tr>`;
//                    }
//                }
//            }

//            roomHtml += `</table></div>`;
//        });

//        roomContainer.innerHTML = roomHtml || "";

//        // ===== DANH SÁCH QUA LƯỢT =====
//        const quaLuotContainer = document.getElementById("quaLuotList");
//        if (quaLuotContainer) {
//            quaLuotContainer.innerHTML = "";
//            const quaLuotData = data.filter(item => item.trangThai === 4);

//            if (!quaLuotData.length) {
//                quaLuotContainer.innerHTML = "";
//            } else {
//                // Tạo một mảng các lớp badge để xoay vòng
//                const badgeClasses = ["badge-1", "badge-2", "badge-3", "badge-4"];
//                let badgeIndex = 0;

//                quaLuotData.forEach(item => {
//                    // Lấy lớp badge tiếp theo (xoay vòng)
//                    const badgeClass = badgeClasses[badgeIndex % badgeClasses.length];
//                    badgeIndex++;

//                    const pill = document.createElement("div");
//                    pill.className = "ticker-item";
//                    pill.innerHTML = `
//                <span class="room-badge ${badgeClass}">${item.tenPhong}</span>
//                ${item.tenBN} — STT ${item.soThuTu}`;
//                    quaLuotContainer.appendChild(pill);
//                });
//            }
//        }

//        // ===== REFRESH =====
//        if (currentInterval) clearTimeout(currentInterval);
//        currentInterval = setTimeout(() => loadSTT(idKhu, idChiNhanh), intervalTime);

//    } catch (err) {
//        console.error("Lỗi load STT:", err);
//        if (currentInterval) clearTimeout(currentInterval);
//        currentInterval = setTimeout(() => loadSTT(idKhu, idChiNhanh), 5000);
//    }
//}

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

        // ===== Gom bệnh nhân theo phòng (loại status = 4) =====
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
                    <th style="width:32%">ĐANG KHÁM</th>
                    <th style="width:48%">CHUẨN BỊ</th>
                  </tr>
                </thead>
                <tbody>
            `;

            list.forEach(room => {
                if (!room.patients || room.patients.length === 0) {
                    // không có dữ liệu bệnh nhân → chỉ hiện tên phòng
                    html += `
                      <tr>
                        <td class="khu-name">${room.maPhong}</td>
                        <td class="stt-kham"></td>
                        <td class="stt-chuanbi"></td>
                      </tr>
                    `;
                } else {
                    // có dữ liệu → render
                    const sorted = room.patients.sort((a, b) => (a.stt ?? 9999) - (b.stt ?? 9999));
                    const top3 = sorted.slice(0, 3);

                    const dangKham = top3.find(p => p.status === 1);
                    const chuanBi = top3.filter(p => p !== dangKham).map(p => p.stt).join(", ");

                    html += `
                      <tr>
                        <td class="khu-name">${room.maPhong}</td>
                        <td class="stt-kham">${dangKham ? dangKham.stt : ""}</td>
                        <td class="stt-chuanbi">${chuanBi}</td>
                      </tr>
                    `;
                }
            });

            html += `</tbody></table>`;
            return html;
        };

        // ===== Chia bảng theo số lượng phòng =====
        if (roomList.length < 5) {
            // 1 bảng duy nhất
            roomContainer.innerHTML = `<div class="queue-single" style="font-size: 2.4rem !important">${renderCol(roomList)}</div>`;
        } else {
            // Chia 2 bên
            const half = Math.ceil(roomList.length / 2);
            const col1 = roomList.slice(0, half);
            const col2 = roomList.slice(half);

            roomContainer.innerHTML = `
                <div class="queue-columns">
                  <div class="queue-col" style="font-size: 2.4rem !important">${renderCol(col1)}</div>
                  <div class="queue-col" style="font-size: 2.4rem !important">${renderCol(col2)}</div>
                </div>
            `;
        }

        // ===== DANH SÁCH QUA LƯỢT (status = 4) =====
        const quaLuotContainer = document.getElementById("quaLuotList");
        if (quaLuotContainer) {
            quaLuotContainer.innerHTML = "";
            const quaLuotData = data.filter(item => item.trangThai === 4);

            if (!quaLuotData.length) {
                quaLuotContainer.innerHTML = "";
            } else {
                const badgeClasses = ["badge-1", "badge-2", "badge-3", "badge-4"];
                let badgeIndex = 0;

                quaLuotData.forEach(item => {
                    const badgeClass = badgeClasses[badgeIndex % badgeClasses.length];
                    badgeIndex++;

                    const pill = document.createElement("div");
                    pill.className = "ticker-item";
                    pill.innerHTML = `
                        <span class="room-badge ${badgeClass}">${item.maPhong}</span>
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


//async function loadSTT(idKhu, idChiNhanh) {
//    if (!idKhu || isNaN(idKhu) || idKhu <= 0 || !idChiNhanh) {
//        console.error("Tham số không hợp lệ. Dừng loadSTT.", { idKhu, idChiNhanh });
//        return;
//    }

//    try {
//        const res = await fetch(`/load_so_thu_tu_khu/filter?IdKhu=${idKhu}&IdChiNhanh=${idChiNhanh}`, {
//            method: "POST"
//        });
//        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//        const json = await res.json();
//        const data = json.data || [];
//        const intervalTime = (json.thoiGian || 5000);

//        // ===== Gom bệnh nhân theo phòng =====
//        const rooms = {};
//        data.forEach(item => {
//            if (!rooms[item.iDPhong]) {
//                rooms[item.iDPhong] = {
//                    id: item.iDPhong,
//                    name: item.tenPhong,
//                    maPhong : item.maPhong,
//                    patients: []
//                };
//            }
//            rooms[item.iDPhong].patients.push({
//                stt: item.soThuTu,
//                status: item.trangThai
//            });
//        });

//        const roomList = Object.values(rooms);

//        // ===== Render bảng =====
//        const roomContainer = document.getElementById("roomContainer");
//        if (!roomContainer) return;

//        // Tách phòng thành 2 cột (trái/phải)
//        const half = Math.ceil(roomList.length / 2);
//        const col1 = roomList.slice(0, half);
//        const col2 = roomList.slice(half);

//        const renderCol = (list) => {
//            let html = `
//              <table class="queue-table" >
//               <thead style="background: #007acc; color: white; font-size: 1.5rem; font-weight: bold; text-align: center;">
//  <tr>
//    <th style="width:20%">Phòng</th>
//    <th style="width:32%">Đang khám</th>
//    <th style="width:48%">Chuẩn bị</th>
//  </tr>
//</thead>
//<tbody>
//            `;
//            list.forEach(room => {
//                // sắp xếp bệnh nhân trong phòng
//                const sorted = room.patients.sort((a, b) => (a.stt ?? 9999) - (b.stt ?? 9999));
//                const top3 = sorted.slice(0, 3);

//                // lấy 1 người đang khám
//                const dangKham = top3.find(p => p.status === 1);
//                // các người còn lại là chuẩn bị
//                const chuanBi = top3.filter(p => p !== dangKham).map(p => p.stt).join(", ");

//                html += `
//                  <tr>
//                    <td class="khu-name">${room.maPhong}</td>
//                    <td class="stt-kham">${dangKham ? dangKham.stt : ""}</td>
//                    <td class="stt-chuanbi">${chuanBi}</td>
//                  </tr>
//                `;
//            });
//            html += `</tbody></table>`;
//            return html;
//        };

//        roomContainer.innerHTML = `
//            <div class="queue-columns">
//              <div class="queue-col">${renderCol(col1)}</div>
//              <div class="queue-col">${renderCol(col2)}</div>
//            </div>
//        `;

//        // ===== Refresh =====
//        if (currentInterval) clearTimeout(currentInterval);
//        currentInterval = setTimeout(() => loadSTT(idKhu, idChiNhanh), intervalTime);

//    } catch (err) {
//        console.error("Lỗi load STT:", err);
//        if (currentInterval) clearTimeout(currentInterval);
//        currentInterval = setTimeout(() => loadSTT(idKhu, idChiNhanh), 5000);
//    }
//}



// ===== DROPDOWN SEARCH CHUNG =====
function initSearchDropdown({ inputId, dropdownId, hiddenFieldId, data = [], onSelect }) {
    const $input = $("#" + inputId);
    const $dropdown = $("#" + dropdownId);
    const $hidden = $("#" + hiddenFieldId);

    let currentData = data;
    let activeIndex = -1;

    // ===== hàm highlight keyword =====
    function highlightMatch(text, keyword) {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword})`, "gi");
        return text.replace(regex, "<span class='highlight'>$1</span>");
    }

    function renderDropdown(keyword, items) {
        $dropdown.empty();
        activeIndex = -1;

        const filtered = items.filter(x =>
            x.ten.toLowerCase().includes(keyword.toLowerCase()) ||
            (x.viettat && x.viettat.toLowerCase().includes(keyword.toLowerCase())) ||
            (x.alias && x.alias.toLowerCase().includes(keyword.toLowerCase()))
        );

        if (!filtered.length) { $dropdown.hide(); return; }

        filtered.forEach((x, idx) => {
            const nameHtml = highlightMatch(x.ten, keyword);
            const aliasHtml = x.viettat ? highlightMatch(x.viettat, keyword) : "";
            const html = `
            <div class="d-flex justify-content-between align-items-center">
                <span class="name">${nameHtml}</span>
                ${aliasHtml ? `<span class="alias text-muted">[${aliasHtml}]</span>` : ""}
            </div>
        `;
            const $item = $(`<div class="dropdown-item" data-id="${x.id}">${html}</div>`);
            $item.on("click", () => selectItem(x));
            $dropdown.append($item);
        });

        $dropdown.show();

        // 🔹 Nếu hidden có value thì chọn đúng item đó
        const selectedId = parseInt($hidden.val(), 10);
        const $items = $dropdown.children(".dropdown-item");

        if (!isNaN(selectedId)) {
            const idx = filtered.findIndex(x => x.id === selectedId);
            if (idx >= 0) {
                $items.removeClass("active").eq(idx).addClass("active");
                activeIndex = idx;
                $items[idx].scrollIntoView({ block: "nearest" });
            } else if ($items.length > 0) {
                // fallback: chọn dòng đầu
                $items.removeClass("active").first().addClass("active");
                activeIndex = 0;
                $items[0].scrollIntoView({ block: "nearest" });
            }
        } else if ($items.length > 0) {
            // chưa có hidden, chọn dòng đầu
            $items.first().addClass("active");
            activeIndex = 0;
            $items[0].scrollIntoView({ block: "nearest" });
        }

    }

    function selectItem(item) {
        $input.val(item.ten);
        $hidden.val(item.id);
        $dropdown.hide();
        if (onSelect) onSelect(item);
    }

    $input.on("input focus", () => renderDropdown($input.val(), currentData));

    $input.on("keydown", e => {
        const $items = $dropdown.children(".dropdown-item");
        if (!$items.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % $items.length;
            $items.removeClass("active").eq(activeIndex).addClass("active")
            [0].scrollIntoView({ block: "nearest" });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + $items.length) % $items.length;
            $items.removeClass("active").eq(activeIndex).addClass("active")
            [0].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0) {
                const $active = $items.eq(activeIndex);
                const id = parseInt($active.data("id"), 10);
                const chosen = currentData.find(x => x.id === id);
                if (chosen) selectItem(chosen);

                // THÊM: Gọi sự kiện lưu khi nhấn Enter
                $("#saveRoomBtn").click();
            }
        }

    });


    $(document).on("click", e => {
        if (!$(e.target).closest("#" + inputId).length && !$(e.target).closest("#" + dropdownId).length)
            $dropdown.hide();
    });

    return {
        renderDropdown: (keyword, items) => renderDropdown(keyword, items),
        setData: newData => { currentData = newData; }
    };
}


// ===== DOM READY =====
document.addEventListener("DOMContentLoaded", function () {
    $.getJSON("dist/data/json/DM_Khu.json")
        .done(function (dataKhu) {
            const listKhu = dataKhu.map(n => ({
                ...n,
                alias: n.viettat?.trim() !== "" ? n.viettat.toUpperCase() :
                    n.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
            }));

            // Khởi tạo dropdown khu
            const khuDropdown = initSearchDropdown({
                inputId: "searchPhong",
                dropdownId: "dropdownPhong",
                hiddenFieldId: "selectedPhongId",
                data: listKhu,
                onSelect: ({ id }) => {
                    const khu = listKhu.find(k => k.id === parseInt(id, 10));
                    if (khu) {
                        $("#roomName").text(khu.ten);
                    }
                }
            });

            // THÊM: Cho phép nhấn Enter trong input để lưu
            $("#searchPhong").on("keydown", function (e) {
                if (e.key === "Enter") {
                    $("#saveRoomBtn").click();
                }
            });

            // Sự kiện click nút lưu
            $("#saveRoomBtn").on("click", function () {
                const khuId = parseInt($("#selectedPhongId").val(), 10);
                const khu = listKhu.find(k => k.id === khuId);
                if (khu) {
                    $("#roomName").text(khu.ten);
                    if (currentInterval) {
                        clearTimeout(currentInterval);
                        currentInterval = null;
                    }
                    if (khuId && window._idcn) {
                        // Gọi hàm loadSTT với khuId thay vì phongId
                        loadSTT(khuId, window._idcn);
                    }
                }
                const modal = bootstrap.Modal.getInstance(document.getElementById("settingsModal"));
                modal.hide();
            });
        })
        .fail(function (jqxhr, textStatus, error) {
            console.error("Lỗi khi load DM_Khu.json:", textStatus, error);
            // Hiển thị thông báo lỗi cho người dùng
            alert("Không thể tải danh sách khu. Vui lòng thử lại sau.");
        });

    // Tự động load dữ liệu nếu đã có khu được chọn
    const idKhuInput = document.getElementById("selectedPhongId");
    if (idKhuInput && idKhuInput.value && window._idcn) {
        const khuId = parseInt(idKhuInput.value, 10);
        if (!isNaN(khuId) && khuId > 0) {
            loadSTT(khuId, window._idcn);
        }
    }
});

// ===== BACKSPACE TRÊN INPUT PHÒNG =====
// THAY THẾ sự kiện Backspace cuối file bằng:
document.getElementById("searchPhong").addEventListener("keydown", function (e) {
    if (e.key === "Backspace") {
        // Chỉ xử lý khi input rỗng hoặc có giá trị selected
        if (this.value === "" || $("#selectedPhongId").val()) {
            e.preventDefault();
            this.value = "";
            $("#selectedPhongId").val("");

            // Trigger sự kiện input để render lại dropdown
            const event = new Event('input', { bubbles: true });
            this.dispatchEvent(event);
        }
    }
});