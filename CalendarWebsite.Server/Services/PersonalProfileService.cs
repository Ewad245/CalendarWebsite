using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;

namespace CalendarWebsite.Server.Services;

public class PersonalProfileService : IPersonalProfileService
{
    private readonly IPersonalProfileRepository _userRepository;

    public PersonalProfileService(IPersonalProfileRepository userRepository)
    {
        _userRepository = userRepository;
    }
    
    public Task<IEnumerable<CustomUserInfo>> GetUsersAsync()
    {
        return _userRepository.GetUsersAsync();
    }

    public Task<IEnumerable<CustomUserInfo>> GetUsersByDepartmentIdOrPositionIdAsync(long departmentId, long positionId)
    {
        return _userRepository.GetUsersByDepartmentIdOrPositionIdAsync(departmentId, positionId);
    }
}