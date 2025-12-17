namespace CalendarWebsite.Server.Models;

public class WorkWeekDto
{
    public long Id { get; set; }
    public string Title { get; set; }
    public bool IsFullTime { get; set; }
    public bool IsDeleted { get; set; }
}