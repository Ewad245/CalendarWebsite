using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Services;

public interface ICustomWorkingTimeService
{
    Task<IEnumerable<CustomWorkingTimeDto>> GetAllCustomWorkingTimesAsync();
    Task<CustomWorkingTimeDto> GetCustomWorkingTimeByIdAsync(long id);
    Task<IEnumerable<CustomWorkingTimeDto>> GetCustomWorkingTimesByPersonalProfileIdAsync(long personalProfileId);
    Task<IEnumerable<CustomWorkingTimeDto>> GetCustomWorkingTimesByWorkWeekIdAsync(long workWeekId);
    Task<CustomWorkingTimeDto> CreateCustomWorkingTimeAsync(CustomWorkingTimeDto customWorkingTimeDto);
    Task<CustomWorkingTimeDto> UpdateCustomWorkingTimeAsync(long id, CustomWorkingTimeDto customWorkingTimeDto);
    Task<bool> DeleteCustomWorkingTimeAsync(long id);
}