using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models;
public class DetailAttendanceDTOExcel
{
    public long RowNum { get; set; }
    public DateTime? WorkingDate { get; set; }
    public DateTime? InAt { get; set; }
    public DateTime? OutAt { get; set; }
    public decimal? Method { get; set; }
    public decimal? Check { get; set; }
    public decimal? EarlyIn { get; set; }
    public decimal? LateIn { get; set; }
    public decimal? EarlyOut { get; set; }
    public decimal? LateOut { get; set; }
    public decimal? Wt { get; set; }
}