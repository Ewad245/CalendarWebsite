using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CalendarWebsite.Server.Controllers;
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DepartmentController: ControllerBase
{
    
    private readonly IDepartmentService _departmentService;

    public DepartmentController(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }
    
    // GET: api/Department
    [HttpGet]
    public async Task<IEnumerable<DepartmentDto>> GetAllDepartments()
    {
        return await _departmentService.GetAllDepartmentsAsync();
    }
}