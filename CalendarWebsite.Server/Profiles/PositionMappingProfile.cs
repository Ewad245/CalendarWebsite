using AutoMapper;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Profiles;

public class PositionMappingProfile: Profile
{
    public PositionMappingProfile()
    {
        CreateMap<Position, PositionDto>();
        CreateMap<PositionDto, Position>();
    }
    
}