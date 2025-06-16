using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace CalendarWebsite.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomWorkingTimeController : ControllerBase
{
    private readonly ICustomWorkingTimeService _customWorkingTimeService;

    public CustomWorkingTimeController(ICustomWorkingTimeService customWorkingTimeService)
    {
        _customWorkingTimeService = customWorkingTimeService;
    }

    // GET: api/CustomWorkingTime
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomWorkingTimeDto>>> GetAllCustomWorkingTimes()
    {
        var customWorkingTimes = await _customWorkingTimeService.GetAllCustomWorkingTimesAsync();
        return Ok(customWorkingTimes);
    }

    // GET: api/CustomWorkingTime/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CustomWorkingTimeDto>> GetCustomWorkingTimeById(long id)
    {
        var customWorkingTime = await _customWorkingTimeService.GetCustomWorkingTimeByIdAsync(id);
        if (customWorkingTime == null)
            return NotFound();

        return Ok(customWorkingTime);
    }

    // GET: api/CustomWorkingTime/profile/5
    [HttpGet("profile/{personalProfileId}")]
    public async Task<ActionResult<IEnumerable<CustomWorkingTimeDto>>> GetCustomWorkingTimesByPersonalProfileId(long personalProfileId)
    {
        var customWorkingTimes = await _customWorkingTimeService.GetCustomWorkingTimesByPersonalProfileIdAsync(personalProfileId);
        return Ok(customWorkingTimes);
    }

    // GET: api/CustomWorkingTime/workweek/5
    [HttpGet("workweek/{workWeekId}")]
    public async Task<ActionResult<IEnumerable<CustomWorkingTimeDto>>> GetCustomWorkingTimesByWorkWeekId(long workWeekId)
    {
        var customWorkingTimes = await _customWorkingTimeService.GetCustomWorkingTimesByWorkWeekIdAsync(workWeekId);
        return Ok(customWorkingTimes);
    }

    // POST: api/CustomWorkingTime
    [HttpPost]
    public async Task<ActionResult<CustomWorkingTimeDto>> CreateCustomWorkingTime(CustomWorkingTimeDto customWorkingTimeDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var createdCustomWorkingTime = await _customWorkingTimeService.CreateCustomWorkingTimeAsync(customWorkingTimeDto);
        return CreatedAtAction(nameof(GetCustomWorkingTimeById), new { id = createdCustomWorkingTime.Id }, createdCustomWorkingTime);
    }

    // PUT: api/CustomWorkingTime/5
    [HttpPut("{id}")]
    public async Task<ActionResult<CustomWorkingTimeDto>> UpdateCustomWorkingTime(long id, CustomWorkingTimeDto customWorkingTimeDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (id != customWorkingTimeDto.Id)
            return BadRequest("ID mismatch");

        var updatedCustomWorkingTime = await _customWorkingTimeService.UpdateCustomWorkingTimeAsync(id, customWorkingTimeDto);
        if (updatedCustomWorkingTime == null)
            return NotFound();

        return Ok(updatedCustomWorkingTime);
    }

    // DELETE: api/CustomWorkingTime/5
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCustomWorkingTime(long id)
    {
        var result = await _customWorkingTimeService.DeleteCustomWorkingTimeAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}