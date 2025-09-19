
using LoadSoThuTuKhu.Service.IS;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

using LoadSoThuTuKhu.Models;
namespace LoadSoThuTuKhu.Service
{
    public class LoadSoThuTuKhuService : LoadSoThuTuKhuInterface
    {
        private readonly Context0302 _dbService;
        private readonly ILogger<LoadSoThuTuKhuService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LoadSoThuTuKhuService(Context0302 dbService,
            ILogger<LoadSoThuTuKhuService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbService = dbService;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<(bool Success, string Message, object Data)>
            FilterSoThuTuPhong(long IdKhu, long IdChiNhanh)
        {
            try
            {
                double thoiGianCapNhat = 5000;
                try
                {
                    var caiDat = await _dbService.HT_CaiDatSTT
                         .FirstOrDefaultAsync(x => x.Loai == "Khu");

                    if (caiDat != null)
                    {
                        thoiGianCapNhat = caiDat.ThoiGian;

                    }
                }
                catch (Exception configEx)
                {
                    _logger.LogWarning(configEx, "Không thể lấy cấu hình từ HT_CaiDatSTT, sử dụng mặc định");
                }

                var allData = await _dbService.LoadSoThuTuKhuModels
                 .FromSqlRaw("EXEC LoadSoThuTuKhu @IdKhu, @IdChiNhanh",
                     new SqlParameter("@IdKhu", IdKhu),
                     new SqlParameter("@IdChiNhanh", IdChiNhanh))
                 .AsNoTracking()
                 .ToListAsync();


                // Nếu allData rỗng, trả về trống
                if (!allData.Any())
                {
                    return (true, "Không có dữ liệu", new
                    {
                        Paged = new List<object>(),
                        Full = new List<object>(),
                        ThoiGian = thoiGianCapNhat
                    });
                }

                return (true, "Thành công", new
                {
                    Data = allData,
                    ThoiGian = thoiGianCapNhat
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi filter số thứ tự phòng");
                return (false, ex.Message, null);
            }
        }
    }
}