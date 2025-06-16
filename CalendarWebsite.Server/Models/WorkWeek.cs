using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models;
[Table("Workweek", Schema = "dbo")]

public class WorkWeek
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    public string Title { get; set; }

    [Required]
    public bool IsFullTime { get; set; }

    public string CreatedBy { get; set; }

    public DateTime? CreatedTime { get; set; }

    public DateTime? LastModified { get; set; }

    public string? ModifiedBy { get; set; }

    [Required]
    public bool IsDeleted { get; set; }
}