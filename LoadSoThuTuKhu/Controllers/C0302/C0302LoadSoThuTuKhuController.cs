using LoadSoThuTuKhu.Models.M0302;
using LoadSoThuTuKhu.Service.IS;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace LoadSoThuTuKhu.Controllers.C0302

{
    [Route("load_so_thu_tu_khu")]
    public class C0302LoadSoThuTuKhuController : Controller
    {
        //private string _maChucNang = "/load_so_thu_tu_khu";
        //private IMemoryCachingServices _memoryCache;

        private readonly IS0302LoadSoThuTuKhuInterface _service;
        private readonly Context0302 _dbService;
        private readonly IWebHostEnvironment _env;

        public C0302LoadSoThuTuKhuController(IS0302LoadSoThuTuKhuInterface service, Context0302 dbService, IWebHostEnvironment env /*, IMemoryCachingServices memoryCache*/)
        {
            _service = service;
            _dbService = dbService;
            _env = env;
            //_memoryCache = memoryCache;

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

            return View("~/Views/V0302/V0302LoadSoThuTuKhu/Index.cshtml", thongTin);

        }
        private long GetIdcnFromBienChung()
        {
            try
            {
                var bienChungPath = Path.Combine(_env.WebRootPath, "dist", "js", "BienChung.js");

                if (System.IO.File.Exists(bienChungPath))
                {
                    var jsContent = System.IO.File.ReadAllText(bienChungPath);

                    var match = Regex.Match(jsContent, @"var _idcn\s*=\s*(\d+);");
                    if (match.Success && long.TryParse(match.Groups[1].Value, out long idcn))
                    {
                        return idcn;
                    }

                    match = Regex.Match(jsContent, @"_idcn\s*:\s*(\d+)");
                    if (match.Success && long.TryParse(match.Groups[1].Value, out idcn))
                    {
                        return idcn;
                    }
                }
            }

            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi đọc BienChung.js: {ex.Message}");
            }

            return 2; // Giá trị mặc định 
        }
        [HttpPost("filter")]
        public async Task<IActionResult> LoadSTT(long IdKhu, long IdChiNhanh)
        {
            var result = await _service.FilterSoThuTuPhong(IdKhu, IdChiNhanh);

            if (!result.Success)
            {
                return Json(new
                {
                    success = false,
                    message = result.Message,
                    data = new List<object>(),
                    thoiGian = 5000  // Thêm thoiGian
                });
            }

            if (result.Data != null)
            {
                var dataType = result.Data.GetType();
                var dataProperty = dataType.GetProperty("Data");
                var thoiGianProperty = dataType.GetProperty("ThoiGian");
                var soDongProperty = dataType.GetProperty("SoDong"); 

                if (dataProperty != null && thoiGianProperty != null)
                {
                    var dataValue = dataProperty.GetValue(result.Data);
                    var thoiGianValue = thoiGianProperty.GetValue(result.Data);

                    var dataList = dataValue as IEnumerable<M0302LoadSoThuTuKhuModel>;

                    if (dataList == null)
                    {
                        return Json(new
                        {
                            success = false,
                            message = "Sai định dạng dữ liệu",
                            data = new List<object>(),
                            thoiGian = 5000  // Thêm thoiGian
                        });
                    }

                    var formattedData = dataList
                        .Select(x => new {
                            soThuTu = x.SoThuTu,
                            tenBN = x.TenBN,
                            maPhong = x.MaPhong,
                            trangThai = x.TrangThai,
                            iDPhong = x.IDPhong,
                            tenPhong = x.TenPhong
                        })
                        .ToList();

                    return Json(new
                    {
                        success = true,
                        message = result.Message,
                        data = formattedData,
                        thoiGian = thoiGianValue ?? 5000  // Trả về thoiGian từ server
                    });
                }
            }

            // Fallback cho trường hợp cũ
            var list = result.Data as IEnumerable<M0302LoadSoThuTuKhuModel>;
            if (list != null)
            {
                var dataList = list
                    .Select(x => new {
                        soThuTu = x.SoThuTu,
                        tenBN = x.TenBN,
                        maPhong = x.MaPhong,
                        trangThai = x.TrangThai,
                        iDPhong = x.IDPhong,
                        tenPhong = x.TenPhong
                    })
                    .ToList();

                return Json(new
                {
                    success = true,
                    message = result.Message,
                    data = dataList,
                    thoiGian = 5000  // Giá trị mặc định
                });
            }

            return Json(new
            {
                success = false,
                message = "Sai định dạng dữ liệu",
                data = new List<object>(),
                thoiGian = 5000  // Thêm thoiGian
            });
        }


    }
}