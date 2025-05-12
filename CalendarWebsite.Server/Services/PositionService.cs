using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;

namespace CalendarWebsite.Server.Services
{
    public class PositionService : IPositionService
    {
        private readonly IPositionRepository _positionRepository;

        public PositionService(IPositionRepository positionRepository)
        {
            _positionRepository = positionRepository;
        }

        public async Task<IEnumerable<PositionDto>> GetAllPositionsAsync()
        {
            return await _positionRepository.GetAllPositionsAsync();
        }
    }
}