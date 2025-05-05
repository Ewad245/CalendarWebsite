namespace CalendarWebsite.Server.Models;

public class DetailAttendanceDtoFilterExcel : DetailAttendanceDTOExcel
{
    public string userId { get; set; } = string.Empty;
    public long? DepartmentId { get; set; }
    public long? PositionId { get; set; }
    public string? FullName { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string PositionName { get; set; } = string.Empty;
}