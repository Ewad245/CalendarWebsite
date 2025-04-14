using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;
using System.Linq;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataOnly_APIaCheckInController : ControllerBase
    {
        private readonly UserDataContext _context;

        public DataOnly_APIaCheckInController(UserDataContext context)
        {
            _context = context;
        }

        // GET: api/DataOnly_APIaCheckIn
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserInfo>>> GetUsers()
        {
            return await _context.Users.AsNoTracking()
                .Where(u => u.FullName != null)
                .GroupBy(u => u.UserId)
                .Select(g => new UserInfo
                {
                    userId = g.Select(u => u.UserId).FirstOrDefault(),
                    fullName = g.Select(x => x.FullName).FirstOrDefault()
                })
                .ToListAsync();

        }

        // GET: api/DataOnly_APIaCheckIn/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<DataOnly_APIaCheckIn>>> GetDataOnly_APIaCheckIn(string id)
        {
            var dataOnly_APIaCheckIn = await _context.Users.Where(w => w.UserId == id).ToListAsync();

            if (dataOnly_APIaCheckIn == null)
            {
                return NotFound();
            }

            return dataOnly_APIaCheckIn;
        }

        // PUT: api/DataOnly_APIaCheckIn/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDataOnly_APIaCheckIn(long id, DataOnly_APIaCheckIn dataOnly_APIaCheckIn)
        {
            if (id != dataOnly_APIaCheckIn.Id)
            {
                return BadRequest();
            }

            _context.Entry(dataOnly_APIaCheckIn).State = EntityState.Modified;

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
        }
    }
}
