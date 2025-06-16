using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Services;

public interface IWorkWeekService
{
    Task<IEnumerable<WorkWeekDto>> GetAllWorkWeeksAsync();
    Task<WorkWeekDto> GetWorkWeekByIdAsync(long id);
    Task<WorkWeekDto> CreateWorkWeekAsync(WorkWeekDto workWeekDto);
    Task<WorkWeekDto> UpdateWorkWeekAsync(long id, WorkWeekDto workWeekDto);
    Task<bool> DeleteWorkWeekAsync(long id);
}