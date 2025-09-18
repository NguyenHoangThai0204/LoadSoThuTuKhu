
using LoadSoThuTuKhu.Models;
using LoadSoThuTuKhu.Service.IS;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace LoadSoThuTuKhu.Controllers

{
    [Route("load_so_thu_tu_khu")]
    public class LoadSoThuTuKhuController : Controller
    {
        //private string _maChucNang = "/load_so_thu_tu_khu";
        //private IMemoryCachingServices _memoryCache;

        private readonly LoadSoThuTuKhuInterface _service;
        private readonly Context0302 _dbService;
        private readonly IWebHostEnvironment _env;

        public LoadSoThuTuKhuController(LoadSoThuTuKhuInterface service, Context0302 dbService, IWebHostEnvironment env)
        {
            _service = service;
            _dbService = dbService;
            _env = env;
        }

        public async Task<IActionResult> Index(long? idChiNhanh)
        {
            //var quyenVaiTro = await _memoryCache.getQuyenVaiTro(_maChucNang);
            //if (quyenVaiTro == null)
            //{
            //    return RedirectToAction("NotFound", "Home");
            //}
            //ViewBag.quyenVaiTro = quyenVaiTro;
            //ViewData["Title"] = CommonServices.toEmptyData(quyenVaiTro);

            ViewBag.quyenVaiTro = new
            {
                Them = true,
                Sua = true,
                Xoa = true,
                Xuat = true,
                CaNhan = true,
                Xem = true,
            };

            if (!idChiNhanh.HasValue || idChiNhanh == 0)
            {
                idChiNhanh = GetIdcnFromBienChung();
            }
            // Truy vấn EF Core
            var thongTin = await _dbService.Set<ThongTinDoanhNghiep>()
                .FirstOrDefaultAsync(x => x.IDChiNhanh == idChiNhanh);

            ViewBag.DoanhNghiep = thongTin;

            return View(thongTin); 
        }
        private long GetIdcnFromBienChung()
        {
            try
            {
                var bienChungPath = Path.Combine(_env.WebRootPath, "dist", "js", "BienChung.js");

                if (System.IO.File.Exists(bienChungPath))
                {
                    var jsContent = System.IO.File.ReadAllText(bienChungPath);

                    // Tìm giá trị _idcn bằng regex
                    var match = Regex.Match(jsContent, @"var _idcn\s*=\s*(\d+);");
                    if (match.Success && long.TryParse(match.Groups[1].Value, out long idcn))
                    {
                        return idcn;
                    }

                    // Hoặc tìm theo cách khác nếu định dạng khác
                    match = Regex.Match(jsContent, @"_idcn\s*:\s*(\d+)");
                    if (match.Success && long.TryParse(match.Groups[1].Value, out idcn))
                    {
                        return idcn;
                    }
                }
            }
            catch (Exception ex)
            {
                // Log lỗi nếu cần
                Console.WriteLine($"Lỗi khi đọc BienChung.js: {ex.Message}");
            }

            return 2; // Giá trị mặc định nếu không đọc được
        }
        [HttpPost("filter")]
        public async Task<IActionResult> LoadSTT(long IdKhu, long IdChiNhanh)
        {
            var result = await _service.FilterSoThuTuPhong(IdKhu, IdChiNhanh);

            if (!result.Success)
            {
                return Json(new { success = false, message = result.Message, data = new List<object>() });
            }

            // Ép kiểu an toàn
            var list = result.Data as IEnumerable<LoadSoThuTuKhuModel>;
            if (list == null)
            {
                return Json(new { success = false, message = "Sai định dạng dữ liệu", data = new List<object>() });
            }

            var dataList = list
            .Select(x => new {
                soThuTu = x.SoThuTu,
                tenBN = x.TenBN,
                trangThai = x.TrangThai,
                iDPhong = x.IDPhong,
                tenPhong = x.TenPhong
            })
            .ToList();


            return Json(new
            {
                success = true,
                message = result.Message,
                data = dataList
            });
        }



    }
}