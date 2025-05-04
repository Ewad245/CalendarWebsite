using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace CalendarWebsite.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PositionController: ControllerBase
{
    
    private readonly IPositionService _positionService;

    public PositionController(IPositionService positionService)
    {
        _positionService = positionService;
    }
    
    // GET: api/Position
    [HttpGet]
    public async Task<IEnumerable<PositionDto>> GetAllPositions()
    {
        return await _positionService.GetAllPositionsAsync();
    }
}