using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Services;

public interface IPersonalProfileService
{
    Task<IEnumerable<CustomUserInfo>> GetUsersAsync();
    Task<IEnumerable<CustomUserInfo>> GetUsersByDepartmentIdOrPositionIdAsync(long departmentId, long positionId);
}