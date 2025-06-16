using AutoMapper;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.Services;

public class CustomWorkingTimeService : ICustomWorkingTimeService
{
    private readonly ICustomWorkingTimeRepository _customWorkingTimeRepository;
    private readonly IMapper _mapper;

    public CustomWorkingTimeService(ICustomWorkingTimeRepository customWorkingTimeRepository, IMapper mapper)
    {
        _customWorkingTimeRepository = customWorkingTimeRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CustomWorkingTimeDto>> GetAllCustomWorkingTimesAsync()
    {
        var customWorkingTimes = await _customWorkingTimeRepository.Query()
            .Where(c => !c.IsDeleted)
            .Include(c => c.WorkWeek)
            .Include(c => c.PersonalProfile)
            .ToListAsync();

        return _mapper.Map<IEnumerable<CustomWorkingTimeDto>>(customWorkingTimes);
    }

    public async Task<CustomWorkingTimeDto> GetCustomWorkingTimeByIdAsync(long id)
    {
        var customWorkingTime = await _customWorkingTimeRepository.Query()
            .Where(c => c.Id == id && !c.IsDeleted)
            .Include(c => c.WorkWeek)
            .Include(c => c.PersonalProfile)
            .FirstOrDefaultAsync();

        if (customWorkingTime == null)
            return null;

        return _mapper.Map<CustomWorkingTimeDto>(customWorkingTime);
    }

    public async Task<IEnumerable<CustomWorkingTimeDto>> GetCustomWorkingTimesByPersonalProfileIdAsync(long personalProfileId)
    {
        var customWorkingTimes = await _customWorkingTimeRepository.Query()
            .Where(c => c.PersonalProfileId == personalProfileId && !c.IsDeleted)
            .Include(c => c.WorkWeek)
            .Include(c => c.PersonalProfile)
            .ToListAsync();

        return _mapper.Map<IEnumerable<CustomWorkingTimeDto>>(customWorkingTimes);
    }

    public async Task<IEnumerable<CustomWorkingTimeDto>> GetCustomWorkingTimesByWorkWeekIdAsync(long workWeekId)
    {
        var customWorkingTimes = await _customWorkingTimeRepository.Query()
            .Where(c => c.WorkweekId == workWeekId && !c.IsDeleted)
            .Include(c => c.WorkWeek)
            .Include(c => c.PersonalProfile)
            .ToListAsync();

        return _mapper.Map<IEnumerable<CustomWorkingTimeDto>>(customWorkingTimes);
    }

    public async Task<CustomWorkingTimeDto> CreateCustomWorkingTimeAsync(CustomWorkingTimeDto customWorkingTimeDto)
    {
        var customWorkingTime = _mapper.Map<CustomWorkingTime>(customWorkingTimeDto);
        customWorkingTime.CreatedTime = DateTime.UtcNow;
        customWorkingTime.IsDeleted = false;

        await _customWorkingTimeRepository.AddAsync(customWorkingTime);

        // Fetch the complete entity with related data for mapping back to DTO
        var createdCustomWorkingTime = await _customWorkingTimeRepository.Query()
            .Where(c => c.Id == customWorkingTime.Id)
            .Include(c => c.WorkWeek)
            .Include(c => c.PersonalProfile)
            .FirstOrDefaultAsync();

        return _mapper.Map<CustomWorkingTimeDto>(createdCustomWorkingTime);
    }

    public async Task<CustomWorkingTimeDto> UpdateCustomWorkingTimeAsync(long id, CustomWorkingTimeDto customWorkingTimeDto)
    {
        var existingCustomWorkingTime = await _customWorkingTimeRepository.GetByIdAsync(id);
        if (existingCustomWorkingTime == null || existingCustomWorkingTime.IsDeleted)
            return null;

        // Update only the fields that should be updated
        existingCustomWorkingTime.WorkweekId = customWorkingTimeDto.WorkweekId;
        existingCustomWorkingTime.PersonalProfileId = customWorkingTimeDto.PersonalProfileId;
        existingCustomWorkingTime.MorningStart = customWorkingTimeDto.MorningStart;
        existingCustomWorkingTime.MorningEnd = customWorkingTimeDto.MorningEnd;
        existingCustomWorkingTime.AfternoonStart = customWorkingTimeDto.AfternoonStart;
        existingCustomWorkingTime.AfternoonEnd = customWorkingTimeDto.AfternoonEnd;
        existingCustomWorkingTime.LastModified = DateTime.UtcNow;

        await _customWorkingTimeRepository.UpdateAsync(existingCustomWorkingTime);

        // Fetch the updated entity with related data for mapping back to DTO
        var updatedCustomWorkingTime = await _customWorkingTimeRepository.Query()
            .Where(c => c.Id == id)
            .Include(c => c.WorkWeek)
            .Include(c => c.PersonalProfile)
            .FirstOrDefaultAsync();

        return _mapper.Map<CustomWorkingTimeDto>(updatedCustomWorkingTime);
    }

    public async Task<bool> DeleteCustomWorkingTimeAsync(long id)
    {
        var customWorkingTime = await _customWorkingTimeRepository.GetByIdAsync(id);
        if (customWorkingTime == null || customWorkingTime.IsDeleted)
            return false;

        customWorkingTime.IsDeleted = true;
        customWorkingTime.LastModified = DateTime.UtcNow;

        await _customWorkingTimeRepository.UpdateAsync(customWorkingTime);
        return true;
    }
}