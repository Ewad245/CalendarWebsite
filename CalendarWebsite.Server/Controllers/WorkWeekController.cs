using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace CalendarWebsite.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkWeekController : ControllerBase
{
    private readonly IWorkWeekService _workWeekService;

    public WorkWeekController(IWorkWeekService workWeekService)
    {
        _workWeekService = workWeekService;
    }

    // GET: api/WorkWeek
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkWeekDto>>> GetAllWorkWeeks()
    {
        var workWeeks = await _workWeekService.GetAllWorkWeeksAsync();
        return Ok(workWeeks);
    }

    // GET: api/WorkWeek/5
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkWeekDto>> GetWorkWeekById(long id)
    {
        var workWeek = await _workWeekService.GetWorkWeekByIdAsync(id);
        if (workWeek == null)
            return NotFound();

        return Ok(workWeek);
    }

    // POST: api/WorkWeek
    [HttpPost]
    public async Task<ActionResult<WorkWeekDto>> CreateWorkWeek(WorkWeekDto workWeekDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var createdWorkWeek = await _workWeekService.CreateWorkWeekAsync(workWeekDto);
        return CreatedAtAction(nameof(GetWorkWeekById), new { id = createdWorkWeek.Id }, createdWorkWeek);
    }

    // PUT: api/WorkWeek/5
    [HttpPut("{id}")]
    public async Task<ActionResult<WorkWeekDto>> UpdateWorkWeek(long id, WorkWeekDto workWeekDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (id != workWeekDto.Id)
            return BadRequest("ID mismatch");

        var updatedWorkWeek = await _workWeekService.UpdateWorkWeekAsync(id, workWeekDto);
        if (updatedWorkWeek == null)
            return NotFound();

        return Ok(updatedWorkWeek);
    }

    // DELETE: api/WorkWeek/5
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteWorkWeek(long id)
    {
        var result = await _workWeekService.DeleteWorkWeekAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}