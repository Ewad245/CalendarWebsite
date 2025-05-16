using CalendarWebsite.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendarWebsite.Server.Services
{
    public interface IPositionService
    {
        Task<IEnumerable<PositionDto>> GetAllPositionsAsync();
    }
}