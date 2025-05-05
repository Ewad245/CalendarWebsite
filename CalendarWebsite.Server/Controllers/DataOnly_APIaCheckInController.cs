using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Services;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataOnly_APIaCheckInController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public DataOnly_APIaCheckInController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        // GET: api/DataOnly_APIaCheckIn
        [HttpGet]
        public async Task<IEnumerable<CustomUserInfo>> GetUsers()
        {
            return await _attendanceService.GetUsersAsync();
        }
        
        // GET: api/DataOnly_APIaCheckIn/Bob@gmail.com
        // This uses Email as id
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<DetailAttendance>>> GetDetailAttendanceNoPag(string id)
        {
            var attendances = await _attendanceService.GetAttendancesByUserIdAsync(id);

            if (attendances == null)
            {
                return NotFound();
            }

            return Ok(attendances);
        }

        // GET: api/DataOnly_APIaCheckIn/Bob@gmail.com?pageNumber=1&pageSize=10&fromDate=2023-01-01&toDate=2023-12-31
        // This uses Email as id with pagination support and optional date filtering
        [HttpGet("pagination/{id}")]
        public async Task<ActionResult<PaginatedResult<DetailAttendance>>> GetDetailAttendanceYesPag(
            string id, 
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var result = await _attendanceService.GetPaginatedAttendancesByUserIdAsync(
                id, pageNumber, pageSize, fromDate, toDate);
            
            return result;
        }
        
        // GET: api/DataOnly_APIaCheckIn/count/Bob@gmail.com
        // Get total count of attendance records for a staff
        [HttpGet("count/{id}")]
        public async Task<ActionResult<int>> GetDetailAttendanceCount(string id)
        {
            var count = await _attendanceService.GetAttendanceCountByUserIdAsync(id);
            return count;
        }

        //GET: api/DataOnly_APIaCheckIn/pagination?pageNumber=1&pageSize=10&fromDate=2023-01-01&toDate=2023-12-31
        // Get all result in case the user do not select specific staff
        [HttpGet("pagination")]
        public async Task<ActionResult<PaginatedResult<DetailAttendance>>> GetAllDetailAttendanceYesPag(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var result = await _attendanceService.GetAllPaginatedAttendancesAsync(
                pageNumber, pageSize, fromDate, toDate);
            
            return result;
        }

        
        //GET: api/DataOnly_APIaCheckIn/filter?departmentId=1&positionId=2&pageNumber=1&pageSize=10&fromDate=2023-01-01&toDate=2023-12-31&userId=user@example.com
        // Get filtered results by department ID and/or position ID with optional user ID and date range filtering
        [HttpGet("filter")]
        public async Task<ActionResult<PaginatedResult<DetailAttendance>>> GetFilteredAttendance(
            [FromQuery] long? departmentId = null,
            [FromQuery] long? positionId = null,
            [FromQuery] string? userId = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var result = await _attendanceService.GetFilteredAttendancesAsync(
                departmentId, positionId, userId, pageNumber, pageSize, fromDate, toDate);
            
            return result;
        }



        // PUT: api/DataOnly_APIaCheckIn/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /*[HttpPut("{id}")]
        public async Task<IActionResult> PutDetailAttendance(long id, DetailAttendance attendance)
        {
            if (id != attendance.Id)
            {
                return BadRequest();
            }

            _context.Entry(attendance).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DataOnly_APIaCheckInExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/DataOnly_APIaCheckIn
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<DataOnly_APIaCheckIn>> PostDataOnly_APIaCheckIn(DataOnly_APIaCheckIn dataOnly_APIaCheckIn)
        {
            _context.Users.Add(dataOnly_APIaCheckIn);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDataOnly_APIaCheckIn", new { id = dataOnly_APIaCheckIn.Id }, dataOnly_APIaCheckIn);
        }

        // DELETE: api/DataOnly_APIaCheckIn/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDataOnly_APIaCheckIn(long id)
        {
            var dataOnly_APIaCheckIn = await _context.Users.FindAsync(id);
            if (dataOnly_APIaCheckIn == null)
            {
                return NotFound();
            }

            _context.Users.Remove(dataOnly_APIaCheckIn);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DataOnly_APIaCheckInExists(long id)
        {
            return _context.Users.Any(e => e.Id == id);
        }*/
    }
}
