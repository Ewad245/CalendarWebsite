using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Repositories;

public interface IPersonalProfileRepository: IGenericRepository<PersonalProfile>
{
    Task<IEnumerable<CustomUserInfo>> GetUsersAsync();
    Task<IEnumerable<CustomUserInfo>> GetUsersByDepartmentIdOrPositionIdAsync(long departmentId, long positionId);
}