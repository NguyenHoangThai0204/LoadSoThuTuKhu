namespace LoadSoThuTuKhu.Models
{
    public class LoadSoThuTuKhuModel
    {
        public int? SoThuTu { get; set; }
        public string? TenBN { get; set; }
        public int? TrangThai { get; set; } // đổi từ string? sang int? cho khớp CASE SQL
        public string TenPhong { get; set; }
        public long IDPhong { get; set; }

    }

}
