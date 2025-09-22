namespace LoadSoThuTuKhu.Service.S0302.IS0302
{
    public interface IS0302LoadSoThuTuKhuInterface
    {
        Task<(bool Success, string Message, object Data)>
            FilterSoThuTuPhong(long IDKhu, long IDChiNhanh);
    }
}
