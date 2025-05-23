using AutoMapper;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;

namespace CalendarWebsite.Server.Services
{
    public class PositionService : IPositionService
    {
        private readonly IPositionRepository _positionRepository;
        private readonly IMapper _mapper;

        public PositionService(IPositionRepository positionRepository, IMapper mapper)
        {
            _positionRepository = positionRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<PositionDto>> GetAllPositionsAsync()
        {
            var positions = await _positionRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<PositionDto>>(positions);
        }
    }
}