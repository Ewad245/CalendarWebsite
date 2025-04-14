using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models;
[Table("DataOnly_APIaCheckIn", Schema = "Dynamic")]

public class UserInfo
{
    public string? userId { get; set; }
    public string? fullName { get; set; } = string.Empty;
    
}