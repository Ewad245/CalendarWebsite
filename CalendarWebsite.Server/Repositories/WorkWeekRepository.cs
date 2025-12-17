using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Repositories;

public class WorkWeekRepository : GenericRepository<WorkWeek>, IWorkWeekRepository
{
    public WorkWeekRepository(DatabaseContext context) : base(context)
    {
    }
}