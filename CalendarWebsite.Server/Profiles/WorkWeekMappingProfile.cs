using AutoMapper;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Profiles;

public class WorkWeekMappingProfile : Profile
{
    public WorkWeekMappingProfile()
    {
        CreateMap<WorkWeek, WorkWeekDto>();
        CreateMap<WorkWeekDto, WorkWeek>();
    }
}