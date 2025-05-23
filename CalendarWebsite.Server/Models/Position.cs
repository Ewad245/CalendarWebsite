using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models;
[Table("Position", Schema = "dbo")]

public class Position
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    public string Title { get; set; }

    public string? Code { get; set; }

    public string? Description { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime? CreatedTime { get; set; }

    public DateTime? LastModified { get; set; }

    public string? ModifiedBy { get; set; }

    [Required]
    public bool IsDeleted { get; set; }

    public string? TitleEN { get; set; }
}