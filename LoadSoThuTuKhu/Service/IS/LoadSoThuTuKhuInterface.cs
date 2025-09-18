namespace LoadSoThuTuKhu.Service.IS
{
    public interface LoadSoThuTuKhuInterface
    {
        Task<(bool Success, string Message, object Data)>
            FilterSoThuTuPhong(long IDKhu, long IDChiNhanh);
    }
}
