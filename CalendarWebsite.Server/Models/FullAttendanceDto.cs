namespace CalendarWebsite.Server.Models;

public class FullAttendanceDto
{
        public DateTime AttendanceDate { get; set; }
        public long PersonalProfileId { get; set; }
        public string? StaffName { get; set; }
        public string? TypeOfLeave { get; set; }
        public string? Note { get; set; }
        public required string Weekday { get; set; }
        public TimeSpan? CustomInTime { get; set; }
        public TimeSpan? CustomOutTime { get; set; }
        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public required string AttendanceStatus { get; set; }
        public string? CheckInStatus { get; set; }
        public string? CheckOutStatus { get; set; }
    
}