namespace LoadSoThuTuKhu.Service.IS
{
    public interface IS0302LoadSoThuTuKhuInterface
    {
        Task<(bool Success, string Message, object Data)>
            FilterSoThuTuPhong(long IDKhu, long IDChiNhanh);
    }
}
