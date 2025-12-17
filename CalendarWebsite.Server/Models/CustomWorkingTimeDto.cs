namespace CalendarWebsite.Server.Models;

public class CustomWorkingTimeDto
{
    public long Id { get; set; }
    public long WorkweekId { get; set; }
    public string WorkWeekTitle { get; set; }
    public long PersonalProfileId { get; set; }
    public string PersonalProfileName { get; set; }
    public double? MorningStart { get; set; }
    public double? MorningEnd { get; set; }
    public double? AfternoonStart { get; set; }
    public double? AfternoonEnd { get; set; }
    public bool IsDeleted { get; set; }
}