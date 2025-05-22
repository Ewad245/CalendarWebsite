using AutoMapper;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Profiles;

public class DepartmentMappingProfile : Profile
{
        public DepartmentMappingProfile()
        {
            CreateMap<Department, DepartmentDto>();
            CreateMap<DepartmentDto, Department>();
        }
    
}