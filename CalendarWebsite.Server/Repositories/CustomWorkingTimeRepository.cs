using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Repositories;

public class CustomWorkingTimeRepository : GenericRepository<CustomWorkingTime>, ICustomWorkingTimeRepository
{
    public CustomWorkingTimeRepository(DatabaseContext context) : base(context)
    {
    }
}