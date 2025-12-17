using AutoMapper;
using CalendarWebsite.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.Profiles;

public class CustomWorkingTimeMappingProfile : Profile
{
    public CustomWorkingTimeMappingProfile()
    {
        CreateMap<CustomWorkingTime, CustomWorkingTimeDto>()
            .ForMember(dest => dest.WorkWeekTitle, opt => opt.MapFrom(src => src.WorkWeek.Title))
            .ForMember(dest => dest.PersonalProfileName, opt => opt.MapFrom(src => src.PersonalProfile.FullName));
            
        CreateMap<CustomWorkingTimeDto, CustomWorkingTime>()
            .ForMember(dest => dest.WorkWeek, opt => opt.Ignore())
            .ForMember(dest => dest.PersonalProfile, opt => opt.Ignore());
    }
}