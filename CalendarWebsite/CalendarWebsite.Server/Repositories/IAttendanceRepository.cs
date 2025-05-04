using CalendarWebsite.Server.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendarWebsite.Server.Repositories
{
    public interface IAttendanceRepository : IGenericRepository<DetailAttendance>
    {
        Task<IEnumerable<CustomUserInfo>> GetUsersAsync();
        Task<IEnumerable<DetailAttendance>> GetAttendancesByUserIdAsync(string userId);
        Task<int> GetAttendanceCountByUserIdAsync(string userId);
        Task<PaginatedResult<DetailAttendance>> GetPaginatedAttendancesByUserIdAsync(string userId, int pageNumber, int pageSize, DateTime? fromDate, DateTime? toDate);
        Task<PaginatedResult<DetailAttendance>> GetAllPaginatedAttendancesAsync(int pageNumber, int pageSize, DateTime? fromDate, DateTime? toDate);
        Task<PaginatedResult<DetailAttendance>> GetFilteredAttendancesAsync(long? departmentId, long? positionId, string? userId, int pageNumber, int pageSize, DateTime? fromDate, DateTime? toDate);
    }
}