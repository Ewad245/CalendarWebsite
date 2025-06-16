using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models;
[Table("PersonalProfile", Schema = "dbo")]

public class PersonalProfile
{
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        public string? AccountId { get; set; }

        [Required]
        public string AccountName { get; set; }

        public string? Name { get; set; }

        public string? FullName { get; set; }

        [Required]
        public long DepartmentId { get; set; }

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }

        public long? ManagerId { get; set; }

        [ForeignKey("ManagerId")]
        public PersonalProfile? Manager { get; set; }

        public long? PositionId { get; set; }

        [ForeignKey("PositionId")]
        public Position? Position { get; set; }

        [Required]
        public bool Gender { get; set; }

        public DateTime? BirthDay { get; set; }

        public string? Address { get; set; }

        public string? StaffId { get; set; }

        public DateTime? DateOfHire { get; set; }

        public string? Mobile { get; set; }

        [StringLength(150)]
        public string? Email { get; set; }

        public long? ImageId { get; set; }

        public string? ImagePath { get; set; }

        public string? SignatureUserName { get; set; }

        public string? SignaturePassword { get; set; }

        [Required]
        public bool EnableSignature { get; set; }

        public int? UserStatus { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        public DateTime? LastModified { get; set; }

        public string? ModifiedBy { get; set; }

        [Required]
        public bool IsDeleted { get; set; }

        public string? SignatureTitle { get; set; }

        public string? SignatureEmail { get; set; }

        public int? UserLevel { get; set; }

        public long? UserPosition { get; set; }

        public string? SignatureImage { get; set; }

        public bool? IsDarkMode { get; set; }

        public string? FlashSignatureImage { get; set; }

        public string? Lang { get; set; }

        public long? CoverImageId { get; set; }

        public string? CoverImagePath { get; set; }

        public long? ThumbnailImageId { get; set; }

        public string? ThumbnailImagePath { get; set; }

        [Required]
        public bool EnableEmail { get; set; }

        [Required]
        public bool EnableNotification { get; set; }

        public string? CalendarChecked { get; set; }

        public string? CalendarColor { get; set; }

        public string? DailyView { get; set; }

        public string? MonthlyView { get; set; }

        public string? WeeklyView { get; set; }

        public string? CalendarResourceSelected { get; set; }

        public string? SubDepartmentIds { get; set; }

        public string? CalendarUserFillter { get; set; }

        public string? IsSyncCalendar { get; set; }

        public bool? TwoFactorEnabled { get; set; }

        [Required]
        public DateTime LastPasswordChanged { get; set; }

        public bool? AuthorizeAutomaticDigitalSigningEnabled { get; set; }

        public string? CalendarResourceChecked { get; set; }

        public string? InternalPhone { get; set; }

        public bool? IsAllowedToUseTheCompanysDigitalSignature { get; set; }

        public bool? ShowEventTheme { get; set; }
}