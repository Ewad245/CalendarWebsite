using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;

namespace CalendarWebsite.Server.Repositories
{
    public class AttendanceRepository : GenericRepository<DetailAttendance>, IAttendanceRepository
    {
        public AttendanceRepository(DatabaseContext context) : base(context)
        {
        }

        public async Task<IEnumerable<DetailAttendance>> GetAttendancesByUserIdAsync(string userId)
        {
            var attendances = await _context.Attendances.Where(w => w.UserId == userId).ToListAsync();
            
            // Convert UTC dates to UTC+7
            foreach (var attendance in attendances)
            {
                ConvertUtcToUtcPlus7(attendance);
            }
            
            return attendances;
        }

        public async Task<int> GetAttendanceCountByUserIdAsync(string userId)
        {
            return await _context.Attendances.CountAsync(w => w.UserId == userId);
        }
        
        public async Task<IEnumerable<DetailAttendance>> GetAttendancesByUserIdDateRangeAsync(string userId, int month, int year)
        {
            // Calculate the first day of the specified month and year
            var startDate = new DateTime(year, month, 1);
            
            // Calculate the first day of the next month
            var endDate = startDate.AddMonths(1);
            
            // Adjust for UTC time (subtract 7 hours as mentioned in other methods)
            // Since database stores UTC time, we need to adjust the dates for filtering
            startDate = startDate.AddHours(-7);
            endDate = endDate.AddHours(-7);
            
            // Query attendance records for the specified user within the date range
            var attendances = await _context.Attendances
                .Where(a => a.UserId == userId && a.At >= startDate && a.At < endDate)
                .OrderBy(a => a.At)
                .ToListAsync();
                
            // Convert UTC dates to UTC+7
            foreach (var attendance in attendances)
            {
                ConvertUtcToUtcPlus7(attendance);
            }
            
            return attendances;
        }
        
        public async Task<IEnumerable<AttendanceWithAbsentDTO>> GetAttendanceWithAbsentByUserIdDateRangeAsync(string userId, int month, int year)
        {
            // Get the actual attendance records first (already converted to UTC+7 in GetAttendancesByUserIdDateRangeAsync)
            var attendances = await GetAttendancesByUserIdDateRangeAsync(userId, month, year);
            
            // Convert to DTO objects
            var attendanceDTOs = attendances.Select(AttendanceWithAbsentDTO.FromDetailAttendance).ToList();
            
            // Get user's full name from the first attendance record (if available)
            string? fullName = attendances.FirstOrDefault()?.FullName ?? "Unknown";
            
            // Calculate the date range to check for absences
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1); // Last day of the month
            
            // If the month is the current month, only calculate absences up to today
            if (month == DateTime.Now.Month && year == DateTime.Now.Year)
            {
                endDate = DateTime.Now;
            }
            
            // Create a dictionary of dates that have attendance records
            var datesWithAttendance = new HashSet<DateTime>(
                attendanceDTOs.Select(a => a.At?.Date ?? DateTime.MinValue)
            );
            
            // Create a list to hold all records including absences
            var result = new List<AttendanceWithAbsentDTO>(attendanceDTOs);
            
            // Loop through all days in the date range
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                // Skip weekends (Saturday and Sunday)
                if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                {
                    continue;
                }
                
                // If no attendance record exists for this date, add an absent record
                if (!datesWithAttendance.Contains(date.Date))
                {
                    result.Add(AttendanceWithAbsentDTO.CreateAbsentRecord(userId, fullName, date));
                }
            }
            
            // Return the combined results ordered by date
            return result.OrderBy(a => a.At);
        }

        public async Task<IEnumerable<FullAttendanceDto>> GetFullAttendancesByUserIdDateRangeAsync(string userId, int month, int year)
        {
            var sql = @"
SET DATEFIRST 7;

WITH DateRange AS (
    SELECT CAST(@StartDate AS DATE) AS WorkDate
    UNION ALL
    SELECT CAST(DATEADD(DAY, 1, WorkDate) AS DATE)
    FROM DateRange
    WHERE WorkDate < CAST(@EndDate AS DATE)
)
SELECT
    e.FullName,
    e.StaffId,
    e.Email,
    d.WorkDate,
    CASE
        WHEN a.at IS NOT NULL THEN 'Present'
        WHEN lr.TuNgay IS NOT NULL AND d.WorkDate BETWEEN CAST(lr.TuNgay AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time' AS DATE) AND CAST(lr.DenNgay AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time' AS DATE) THEN 'On Leave'
        ELSE 'Absent'
    END AS AttendanceStatus,
    lr.LoaiPhepNam AS TypeOfLeave,
    lr.GhiChu AS Note,
    CONVERT(DATETIME2, a.inAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') AS InAt,
    CONVERT(DATETIME2, a.OutAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') AS OutAt,
    a.Method,
    a.[Check],
    a.EarlyIn,
    a.LateIn,
    a.EarlyOut,
    a.LateOut
FROM
    [dbo].[PersonalProfile] e
    CROSS JOIN DateRange d
    LEFT JOIN [Dynamic].[DataOnly_APIaCheckIn] a 
        ON e.Email = a.userId 
        AND CONVERT(DATE, a.at AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') = d.WorkDate
    LEFT JOIN [Dynamic].[Data_HCQĐ07BM01] lr 
        ON e.FullName = lr.NguoiDeNghi 
        AND d.WorkDate BETWEEN CAST(lr.TuNgay AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time' AS DATE) AND CAST(lr.DenNgay AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time' AS DATE)
WHERE
    DATEPART(dw, d.WorkDate) NOT IN (1, 7) -- Exclude Sunday (1) and Saturday (7)
    AND e.Email = @UserId
ORDER BY
    e.FullName, d.WorkDate;";
            var startDate = new DateTime(year, month, 1);
            DateTime? endDate = null;
            if (month == DateTime.Now.Month && year == DateTime.Now.Year)
            {
                endDate = DateTime.Now;
            }
            else
            {
                endDate = startDate.AddMonths(1).AddDays(-1); // Last day of the month
            }
            var attendances = _context.Database.GetDbConnection().QueryAsync<FullAttendanceDto>(sql, new { StartDate = startDate, EndDate = endDate , UserId = userId});
            return await attendances;
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
            var result = await PaginationHelper.CreatePaginatedResultAsync(query, pageNumber, pageSize);
            
            // Convert UTC dates to UTC+7 for each item in the result
            foreach (var attendance in result.Items)
            {
                ConvertUtcToUtcPlus7(attendance);
            }
            
            return result;
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
            var result = await PaginationHelper.CreatePaginatedResultAsync(query, pageNumber, pageSize);
            
            // Convert UTC dates to UTC+7 for each item in the result
            foreach (var attendance in result.Items)
            {
                ConvertUtcToUtcPlus7(attendance);
            }
            
            return result;
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
            var result = await PaginationHelper.CreatePaginatedResultAsync(query, pageNumber, pageSize);
            
            // Convert UTC dates to UTC+7 for each item in the result
            foreach (var attendance in result.Items)
            {
                ConvertUtcToUtcPlus7(attendance);
            }
            
            return result;
        }
        // Helper method to convert UTC dates to UTC+7
        private void ConvertUtcToUtcPlus7(DetailAttendance attendance)
        {
            // Convert At date from UTC to UTC+7
            if (attendance.At.HasValue)
            {
                attendance.At = attendance.At.Value.AddHours(7);
            }
            
            // Convert InAt date from UTC to UTC+7
            if (attendance.InAt.HasValue)
            {
                attendance.InAt = attendance.InAt.Value.AddHours(7);
            }
            
            // Convert OutAt date from UTC to UTC+7
            if (attendance.OutAt.HasValue)
            {
                attendance.OutAt = attendance.OutAt.Value.AddHours(7);
            }
        }
    }
}