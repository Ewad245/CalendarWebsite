using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace CalendarWebsite.Server.Repositories
{
    public class PositionRepository : GenericRepository<Position>, IPositionRepository
    {
        public PositionRepository(DatabaseContext context) : base(context)
        {
        }

        public async Task<IEnumerable<PositionDto>> GetAllPositionsAsync()
        {
            return await _context.Positions.Select(o => new PositionDto()
            {
                Id = o.Id,
                Title = o.Title,
            }).ToListAsync();
        }
    }
}