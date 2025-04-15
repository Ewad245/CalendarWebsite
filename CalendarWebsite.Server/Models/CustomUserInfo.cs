using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models;

public class CustomUserInfo
{
    public long Id { get; set; }
    public string? Email { get; set; }
    public string? FullName { get; set; } = string.Empty;
}