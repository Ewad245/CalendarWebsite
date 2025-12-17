using AutoMapper;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;

namespace CalendarWebsite.Server.Services;

public class WorkWeekService : IWorkWeekService
{
    private readonly IWorkWeekRepository _workWeekRepository;
    private readonly IMapper _mapper;

    public WorkWeekService(IWorkWeekRepository workWeekRepository, IMapper mapper)
    {
        _workWeekRepository = workWeekRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<WorkWeekDto>> GetAllWorkWeeksAsync()
    {
        var workWeeks = await _workWeekRepository.FindAsync(w => !w.IsDeleted);
        return _mapper.Map<IEnumerable<WorkWeekDto>>(workWeeks);
    }

    public async Task<WorkWeekDto> GetWorkWeekByIdAsync(long id)
    {
        var workWeek = await _workWeekRepository.GetByIdAsync(id);
        if (workWeek == null || workWeek.IsDeleted)
            return null;

        return _mapper.Map<WorkWeekDto>(workWeek);
    }

    public async Task<WorkWeekDto> CreateWorkWeekAsync(WorkWeekDto workWeekDto)
    {
        var workWeek = _mapper.Map<WorkWeek>(workWeekDto);
        workWeek.CreatedTime = DateTime.UtcNow;
        workWeek.IsDeleted = false;

        await _workWeekRepository.AddAsync(workWeek);
        return _mapper.Map<WorkWeekDto>(workWeek);
    }

    public async Task<WorkWeekDto> UpdateWorkWeekAsync(long id, WorkWeekDto workWeekDto)
    {
        var existingWorkWeek = await _workWeekRepository.GetByIdAsync(id);
        if (existingWorkWeek == null || existingWorkWeek.IsDeleted)
            return null;

        _mapper.Map(workWeekDto, existingWorkWeek);
        existingWorkWeek.LastModified = DateTime.UtcNow;

        await _workWeekRepository.UpdateAsync(existingWorkWeek);
        return _mapper.Map<WorkWeekDto>(existingWorkWeek);
    }

    public async Task<bool> DeleteWorkWeekAsync(long id)
    {
        var workWeek = await _workWeekRepository.GetByIdAsync(id);
        if (workWeek == null || workWeek.IsDeleted)
            return false;

        workWeek.IsDeleted = true;
        workWeek.LastModified = DateTime.UtcNow;

        await _workWeekRepository.UpdateAsync(workWeek);
        return true;
    }
}