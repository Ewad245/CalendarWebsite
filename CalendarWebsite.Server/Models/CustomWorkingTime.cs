using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models;
[Table("CustomWorkingTime", Schema = "dbo")]

public class CustomWorkingTime
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    public long WorkweekId { get; set; }

    [ForeignKey("WorkweekId")]
    public WorkWeek WorkWeek { get; set; }

    [Required]
    public long PersonalProfileId { get; set; }

    [ForeignKey("PersonalProfileId")]
    public PersonalProfile PersonalProfile { get; set; }

    public double? MorningStart { get; set; }

    public double? MorningEnd { get; set; }

    public double? AfternoonStart { get; set; }

    public double? AfternoonEnd { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime? CreatedTime { get; set; }

    public DateTime? LastModified { get; set; }

    public string? ModifiedBy { get; set; }

    [Required]
    public bool IsDeleted { get; set; }
}