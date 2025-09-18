
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

                //_logger.LogInformation("STT={STT}, TenBN={TenBN}",
                //       IdKhu,
                //       IdChiNhanh);

                var allData = await _dbService.LoadSoThuTuKhuModels
                 .FromSqlRaw("EXEC LoadSoThuTuKhu @IdKhu, @IdChiNhanh",
                     new SqlParameter("@IdKhu", IdKhu),
                     new SqlParameter("@IdChiNhanh", IdChiNhanh))
                 .AsNoTracking()
                 .ToListAsync();

            
                // Nếu allData rỗng, trả về trống
                if (!allData.Any())
                {
                    return (true, "Không có dữ liệu", new { Paged = new List<object>(), Full = new List<object>() });
                }


                return (true, "Thành công", allData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi filter số thứ tự phòng");
                return (false, ex.Message, null);
            }
        }
    }
}