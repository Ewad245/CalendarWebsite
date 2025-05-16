namespace CalendarWebsite.Server.Models;

public class FullAttendanceDto
{
        public string FullName { get; set; }
        public string StaffId { get; set; }
        public string Email { get; set; }
        public DateTime WorkDate { get; set; }
        public string AttendanceStatus { get; set; }
        public string? TypeOfLeave { get; set; }
        public string? Note { get; set; }
        public DateTime? InAt { get; set; }
        public DateTime? OutAt { get; set; }
        public decimal? Method { get; set; }
        public decimal? Check { get; set; }
        public decimal? EarlyIn { get; set; }
        public decimal? LateIn { get; set; }
        public decimal? EarlyOut { get; set; }
        public decimal? LateOut { get; set; }
    
}