using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalendarWebsite.Server.Repositories
{
    public class AttendanceRepository : GenericRepository<DetailAttendance>, IAttendanceRepository
    {
        public AttendanceRepository(DatabaseContext context) : base(context)
        {
        }

        public async Task<IEnumerable<DetailAttendance>> GetAttendancesByUserIdAsync(string userId)
        {
            return await _context.Attendances.Where(w => w.UserId == userId).ToListAsync();
        }

        public async Task<int> GetAttendanceCountByUserIdAsync(string userId)
        {
            return await _context.Attendances.CountAsync(w => w.UserId == userId);
        }

        public async Task<PaginatedResult<DetailAttendance>> GetPaginatedAttendancesByUserIdAsync(
            string userId, 
            int pageNumber, 
            int pageSize, 
            DateTime? fromDate, 
            DateTime? toDate)
        {
            // Adjust fromDate and toDate to UTC if they have values
            // Since database stores UTC time, we need to subtract 7 hours from the input dates for filtering
            if (fromDate.HasValue)
            {
                fromDate = fromDate.Value.AddHours(-7);
            }
            
            if (toDate.HasValue)
            {
                toDate = toDate.Value.AddHours(-7);
            }
            
            var query = _context.Attendances.AsQueryable().Where(w => w.UserId == userId);
            
            // Apply date filters if provided
            if (fromDate.HasValue)
            {
                query = query.Where(a => a.At >= fromDate.Value);
            }
            
            if (toDate.HasValue)
            {
                // Include the entire day for the end date
                var endDate = toDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(a => a.At <= endDate);
            }
            
            // Order by date, most recent first
            query = query.OrderByDescending(a => a.At);
            
            // Use the pagination helper to create the paginated result
            return await PaginationHelper.CreatePaginatedResultAsync(query, pageNumber, pageSize);
        }

        public async Task<PaginatedResult<DetailAttendance>> GetAllPaginatedAttendancesAsync(
            int pageNumber, 
            int pageSize,
            DateTime? fromDate, 
            DateTime? toDate)
        {
            // Adjust fromDate and toDate to UTC if they have values
            // Since database stores UTC time, we need to subtract 7 hours from the input dates for filtering
            if (fromDate.HasValue)
            {
                fromDate = fromDate.Value.AddHours(-7);
            }
            
            if (toDate.HasValue)
            {
                toDate = toDate.Value.AddHours(-7);
            }

            var query = _context.Attendances.AsQueryable();
            
            // Apply date filters if provided
            if (fromDate.HasValue)
            {
                query = query.Where(a => a.At >= fromDate.Value);
            }
            
            if (toDate.HasValue)
            {
                // Include the entire day for the end date
                var endDate = toDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(a => a.At <= endDate);
            }
            
            // Order by date, most recent first
            query = query.OrderByDescending(a => a.At);
            
            // Use the pagination helper to create the paginated result
            return await PaginationHelper.CreatePaginatedResultAsync(query, pageNumber, pageSize);
        }

        public async Task<PaginatedResult<DetailAttendance>> GetFilteredAttendancesAsync(
            long? departmentId,
            long? positionId,
            string? userId,
            int pageNumber,
            int pageSize,
            DateTime? fromDate,
            DateTime? toDate)
        {
            // Adjust fromDate and toDate to UTC if they have values
            // Since database stores UTC time, we need to subtract 7 hours from the input dates for filtering
            if (fromDate.HasValue)
            {
                fromDate = fromDate.Value.AddHours(-7);
            }
            
            if (toDate.HasValue)
            {
                toDate = toDate.Value.AddHours(-7);
            }

            // Get users matching department and position filters
            var userQuery = _context.Users.Select(p => new CustomUserInfo()
            {
                Id = p.Id,
                Email = p.Email,
                FullName = p.FullName,
                DepartmentId = p.DepartmentId,
                PositionId = p.PositionId,
            });

            if (departmentId.HasValue)
            {
                userQuery = userQuery.Where(u => u.DepartmentId == departmentId.Value);
            }
            
            if (positionId.HasValue)
            {
                userQuery = userQuery.Where(u => u.PositionId == positionId.Value);
            }
            
            // Get the filtered user IDs (emails)
            var filteredUserIds = await userQuery.Select(u => u.Email).ToListAsync();
            
            // Start with attendance records
            var query = _context.Attendances.AsQueryable();
            
            // Apply user ID filter directly if provided
            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(a => a.UserId == userId);
            }
            // Otherwise, filter by the department/position filtered user IDs
            else if (departmentId.HasValue || positionId.HasValue)
            {
                query = query.Where(a => filteredUserIds.Contains(a.UserId));
            }
            
            // Apply date filters if provided
            if (fromDate.HasValue)
            {
                query = query.Where(a => a.At >= fromDate.Value);
            }
            
            if (toDate.HasValue)
            {
                // Include the entire day for the end date
                var endDate = toDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(a => a.At <= endDate);
            }
            
            // Order by date, most recent first
            query = query.OrderByDescending(a => a.At);
            
            // Use the pagination helper to create the paginated result
            return await PaginationHelper.CreatePaginatedResultAsync(query, pageNumber, pageSize);
        }
    }
}