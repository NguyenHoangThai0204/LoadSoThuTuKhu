// ===== BIẾN TOÀN CỤC =====
let currentInterval = null;

// ===== HÀM LOAD SỐ THỨ TỰ =====

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
                    <th style="width:38%">ĐANG KHÁM</th>
                    <th style="width:42%">CHUẨN BỊ</th>
                  </tr>
                </thead>
                <tbody>
            `;

            list.forEach(room => {
                if (!room.patients || room.patients.length === 0) {
                    // không có dữ liệu bệnh nhân → chỉ hiện tên phòng
                    html += `
                      <tr>
                        <td class="khu-name" style="background-color: #ECF3FB !important;color: #3691BA !important;">${room.maPhong}</td>
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
                        <td class="khu-name" style="background-color: #ECF3FB !important;color: #3691BA !important;">${room.maPhong}</td>
                        <td class="stt-chuanbi" style="font-size: 3.2rem !important;">${dangKham ? dangKham.stt : ""}</td>
                        <td class="stt-chuanbi" style="font-size: 3.2rem !important;">${chuanBi}</td>
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
            roomContainer.innerHTML = `<div class="queue-col" style="font-size: 3.2rem !important;">${renderCol(roomList)}</div>`;
        } else {
            // Chia 2 bên
            const half = Math.ceil(roomList.length / 2);
            const col1 = roomList.slice(0, half);
            const col2 = roomList.slice(half);

            roomContainer.innerHTML = `
                <div class="queue-columns">
                  <div class="queue-col" style="font-size: 3.2rem !important">${renderCol(col1)}</div>
                  <div class="queue-col" style="font-size:3.2rem !important">${renderCol(col2)}</div>
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

        if (!filtered.length) {
            $dropdown.hide();
            return;
        }

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
                $items.removeClass("active").first().addClass("active");
                activeIndex = 0;
                $items[0].scrollIntoView({ block: "nearest" });
            }
        } else if ($items.length > 0) {
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

                // ❌ KHÔNG gọi save ở đây
            }
        }
    });

    $(document).on("click", e => {
        if (!$(e.target).closest("#" + inputId).length && !$(e.target).closest("#" + dropdownId).length) {
            $dropdown.hide();
        }
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
            const listKhu = dataKhu
                .filter(n => n.active === true || n.active === 1) // chỉ lấy khu active
                .map(n => ({
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
                    // chỉ gán tạm, chưa cập nhật roomName
                    console.log("Đã chọn khu ID:", id);
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
                        // Gọi hàm loadSTT với khuId
                        loadSTT(khuId, window._idcn);
                    }
                }
                const modal = bootstrap.Modal.getInstance(document.getElementById("settingsModal"));
                modal.hide();
            });
        })
        .fail(function (jqxhr, textStatus, error) {
            console.error("Lỗi khi load DM_Khu.json:", textStatus, error);
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
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchPhong");
    const hiddenPhong = document.getElementById("selectedPhongId");

    if (!searchInput) return;

    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Backspace") {

            const hasSelectedItem = hiddenPhong && hiddenPhong.value;
            const isSearching = this.value && !hasSelectedItem;

            if (hasSelectedItem) {
                e.preventDefault();
                e.stopPropagation();

                this.value = "";
                hiddenPhong.value = "";
                this.dispatchEvent(new Event("input", { bubbles: true }));

                console.log("Đã chọn item - xóa toàn bộ");
            } else if (isSearching) {
                console.log("Đang tìm kiếm - backspace bình thường");
            } else {
                e.preventDefault();
                this.value = "";
                if (hiddenPhong) hiddenPhong.value = "";
                console.log("Input rỗng - clear all");
            }
        }
    });
});