using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models;
[Table("PersonalProfile", Schema = "dbo")]

public class UserInfo
{
    public long? Id { get; set; }
    public string? AccountId { get; set; } = string.Empty;
    public string? AccountName { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? FullName { get; set; } = string.Empty;
    public long? DepartmentId { get; set; }
    public long? ManagerId { get; set; }
    public long? PositionId { get; set; }
    public bool? Gender { get; set; }
    public DateTime? BirthDay { get; set; }
    public string? Address { get; set; } = string.Empty;
    public string? StaffId { get; set; } = string.Empty;
    public DateTime? DateOfHire { get; set; }
    public string? Mobile { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public long? ImageId { get; set; }
    public string? ImagePath { get; set; }
    public string? SignatureUserName { get; set; }
    public string? SignaturePassword { get; set; }
    public bool? EnableSignature { get; set; }
    public int? UserStatus { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? CreatedTime { get; set; }
    public DateTime? LastModified { get; set; }
    public string? ModifiedBy { get; set; } = string.Empty;
    public bool? IsDeleted { get; set; }
    public string? SignatureTitle { get; set; }
    public string? SignatureEmail { get; set; }
    public string? UserLevel { get; set; }
    public string? UserPosition { get; set; }
    public string? SignatureImage { get; set; }
    public bool? IsDarkMode { get; set; }
    public string? FlashSignatureImage { get; set; }
    public string Lang { get; set; } = string.Empty;
    public string? CoverImageId { get; set; }
    public string? CoverImagePath { get; set; }
    public string? ThumbnailImageId { get; set; }
    public string? ThumbnailImagePath { get; set; }
    public bool? EnableEmail { get; set; }
    public bool? EnableNotification { get; set; }
    public string? CalendarChecked { get; set; }
    public string? CalendarColor { get; set; }
    public string? DailyView { get; set; }
    public string? MonthlyView { get; set; }
    public string? WeeklyView { get; set; }
    public string? CalendarResourceSelected { get; set; }
    public string? SubDepartmentIds { get; set; }
    public string? CalendarUserFillter { get; set; }
    public bool? IsSyncCalendar { get; set; }
    public bool? TwoFactorEnabled { get; set; }
    public DateTime? LastPasswordChanged { get; set; }
    public bool? AuthorizeAutomaticDigitalSigningEnabled { get; set; }
    public string? CalendarResourceChecked { get; set; }
    public string? InternalPhone { get; set; }
    public bool? IsAllowedToUseTheCompanysDigitalSignature { get; set; }
    public string? ShowEventTheme { get; set; }
}