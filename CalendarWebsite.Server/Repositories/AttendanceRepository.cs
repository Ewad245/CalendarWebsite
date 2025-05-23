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
WITH Calendar AS (
    -- Generate a list of dates in the range
    SELECT CAST(DATEADD(DAY, number, @StartDate) AS DATE) AS AttendanceDate,
        DATENAME(WEEKDAY, DATEADD(DAY, number, @StartDate)) AS Weekday
    FROM master.dbo.spt_values
    WHERE type = 'P'
      AND DATEADD(DAY, number, @StartDate) <= @EndDate
),
     Staff AS (
         -- Get all staff with custom working times
         SELECT pp.Id AS PersonalProfileId, pp.FullName, pp.Email as Email
         FROM PersonalProfile pp
         WHERE pp.Email = @UserId
     ),
    CustomSchedule AS (
        -- Get all the valid custom schedule for a person
        SELECT w.Title AS Title, cwt.MorningStart AS MorningStart, cwt.MorningEnd AS MorningEnd,
               cwt.AfternoonStart AS AfternoonStart, cwt.AfternoonEnd AS AfternoonEnd, cwt.PersonalProfileId AS PersonalProfileId
        from CustomWorkingTime cwt
        inner join Workweek w on w.Id = cwt.WorkweekId
        where w.IsDeleted = 0 AND cwt.IsDeleted = 0
    )
SELECT
    c.AttendanceDate,
    s.PersonalProfileId,
    s.FullName AS StaffName,
    lr.LoaiPhepNam as TypeOfLeave,
    lr.GhiChu AS Note,
    c.Weekday,
    DATEADD(MINUTE, sce.MorningStart * 60, CAST('00:00' AS TIME)) as CustomInTime,
    DATEADD(MINUTE, sce.AfternoonEnd * 60, CAST('00:00' AS TIME)) as CustomOutTime,
    CONVERT(DATETIME2, ci.inAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') AS CheckInTime,
    CONVERT(DATETIME2, ci.outAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') AS CheckOutTime,
    CASE
        WHEN lr.UserWorkflowId IS NOT NULL THEN 'On Leave'
        WHEN ci.inAt IS NULL AND ci.outAt IS NULL THEN 'Absent'
        ELSE 'Present'
        END AS AttendanceStatus,
    CASE
        WHEN ci.inAt IS NULL THEN NULL
        WHEN sce.PersonalProfileId IS NOT NULL AND sce.Title = c.Weekday THEN
            CASE
                WHEN CONVERT(TIME, ci.inAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') > DATEADD(MINUTE, sce.MorningStart * 60, CAST('00:00' AS TIME))
                    THEN 'Late In'
                WHEN CONVERT(TIME, ci.inAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') < DATEADD(MINUTE, sce.MorningStart * 60, CAST('00:00' AS TIME))
                    THEN 'Early In'
                ELSE 'On Time'
                END
        ELSE
            CASE
                WHEN ci.lateIn > 0 THEN 'Late In'
                WHEN ci.earlyIn > 0 THEN 'Early In'
                WHEN (ci.earlyIn = 0 AND ci.lateIn = 0) THEN 'On Time'
                ELSE 'On Time'
                END
        END AS CheckInStatus,
    CASE
        WHEN ci.outAt IS NULL THEN NULL
        WHEN sce.PersonalProfileId IS NOT NULL AND sce.Title = c.Weekday THEN
            CASE
                WHEN CONVERT(TIME, ci.outAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') < DATEADD(MINUTE, sce.AfternoonEnd * 60, CAST('00:00' AS TIME))
                    THEN 'Early Out'
                WHEN CONVERT(TIME, ci.outAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') > DATEADD(MINUTE, sce.AfternoonEnd * 60, CAST('00:00' AS TIME))
                    THEN 'Late Out'
                ELSE 'On Time'
                END
        ELSE
            CASE
                WHEN ci.earlyOut > 0 THEN 'Early Out'
                WHEN ci.lateOut > 0 Then 'Late Out'
                WHEN (ci.earlyOut = 0 AND ci.lateOut = 0) THEN 'On Time'
                ELSE 'On Time'
                END
        END AS CheckOutStatus
FROM Calendar c
         CROSS JOIN Staff s
         LEFT JOIN Dynamic.DataOnly_APIaCheckIn ci
                   ON s.Email = ci.userId
                       AND CONVERT(DATE, ci.inAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') = c.AttendanceDate
         LEFT JOIN Dynamic.Data_HCQĐ07BM01 lr
                   ON s.FullName = lr.NguoiDeNghi
                       AND c.AttendanceDate BETWEEN CONVERT(DATE, lr.TuNgay AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time')
                            AND CONVERT(DATE, lr.DenNgay AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time')
         LEFT JOIN CustomSchedule AS sce
                    On sce.PersonalProfileId = s.PersonalProfileId
                    AND sce.Title = c.Weekday
    WHERE DATEPART(dw, c.AttendanceDate) NOT IN (1, 7)
ORDER BY c.AttendanceDate, s.PersonalProfileId;";
            var startDate = new DateTime(year, month, 1);
            DateTime? endDate = null;
            if (month > DateTime.Now.Month && year >= DateTime.Now.Year)
            {
                return [];
            }
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
            List<string> filteredUserIds;
            if (!string.IsNullOrEmpty(userId))
            {
                // If specific userId is provided, use only that
                filteredUserIds = new List<string> { userId };
            }
            else if (departmentId.HasValue || positionId.HasValue)
            {
                // Otherwise use the department/position filtered IDs
                filteredUserIds = await userQuery.Select(u => u.Email).ToListAsync();
            }
            else
            {
                // If no filters, get all users
                filteredUserIds = await userQuery.Select(u => u.Email).ToListAsync();
            }
            
            // Adjust fromDate and toDate to UTC if they have values
            DateTime startDate = fromDate?.AddHours(-7) ?? DateTime.Now.AddMonths(-1).AddHours(-7);
            DateTime endDate = toDate?.AddHours(-7).Date.AddDays(1).AddTicks(-1) ?? DateTime.Now.AddHours(-7);
            
            // Calculate total count for pagination using SQL
            var countSql = @"
                SELECT COUNT(*)
                FROM Dynamic.DataOnly_APIaCheckIn ci
                WHERE (@UserId IS NULL OR ci.userId IN @UserIds)
                AND ci.At >= @StartDate AND ci.At <= @EndDate";
                
            var totalCount = await _context.Database.GetDbConnection().ExecuteScalarAsync<int>(
                countSql,
                new { UserIds = filteredUserIds, StartDate = startDate, EndDate = endDate, UserId = userId });
            
            // Calculate pagination values
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            var skip = (pageNumber - 1) * pageSize;
            
            // SQL query to get paginated attendance records with proper ordering and calculate early/late values
            var sql = @"
                WITH Staff AS (
                    -- Get all staff with custom working times
                    SELECT pp.Id AS PersonalProfileId, pp.FullName, pp.Email as Email
                    FROM PersonalProfile pp
                    WHERE pp.Email IN @UserIds
                ),
                CustomSchedule AS (
                    -- Get all the valid custom schedule for a person
                    SELECT w.Title AS Title, cwt.MorningStart AS MorningStart, cwt.MorningEnd AS MorningEnd,
                           cwt.AfternoonStart AS AfternoonStart, cwt.AfternoonEnd AS AfternoonEnd, cwt.PersonalProfileId AS PersonalProfileId
                    FROM CustomWorkingTime cwt
                    INNER JOIN Workweek w ON w.Id = cwt.WorkweekId
                    WHERE w.IsDeleted = 0 AND cwt.IsDeleted = 0
                )
                SELECT
    ci.Id,
    ci.UserWorkflowId,
    ci.UserId,
    ci.Method,
    ci.[Check],
    -- Calculate EarlyIn based on custom schedule if available
    CASE
        WHEN sce.PersonalProfileId IS NOT NULL AND sce.Title = DATENAME(WEEKDAY, ci.At) THEN
            CASE
                WHEN CONVERT(TIME, ci.inAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') <
                     DATEADD(MINUTE, sce.MorningStart * 60, CAST('00:00' AS TIME))
                    THEN DATEDIFF(MINUTE,
                                  CONVERT(TIME, ci.inAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time'),
                                  DATEADD(MINUTE, sce.MorningStart * 60, CAST('00:00' AS TIME)))
                ELSE 0
                END
        ELSE ci.EarlyIn
        END AS EarlyIn,
    -- Calculate LateIn based on custom schedule if available
    CASE
        WHEN sce.PersonalProfileId IS NOT NULL AND sce.Title = DATENAME(WEEKDAY, ci.At) THEN
            CASE
                WHEN CONVERT(TIME, ci.inAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') >
                     DATEADD(MINUTE, sce.MorningStart * 60, CAST('00:00' AS TIME))
                    THEN DATEDIFF(MINUTE,
                                  DATEADD(MINUTE, sce.MorningStart * 60, CAST('00:00' AS TIME)),
                                  CONVERT(TIME, ci.inAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time'))
                ELSE 0
                END
        ELSE ci.LateIn
        END AS LateIn,
    -- Calculate EarlyOut based on custom schedule if available
    CASE
        WHEN sce.PersonalProfileId IS NOT NULL AND sce.Title = DATENAME(WEEKDAY, ci.At) THEN
            CASE
                WHEN CONVERT(TIME, ci.outAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') <
                     DATEADD(MINUTE, sce.AfternoonEnd * 60, CAST('00:00' AS TIME))
                    THEN DATEDIFF(MINUTE,
                                  CONVERT(TIME, ci.outAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time'),
                                  DATEADD(MINUTE, sce.AfternoonEnd * 60, CAST('00:00' AS TIME)))
                ELSE 0
                END
        ELSE ci.EarlyOut
        END AS EarlyOut,
    -- Calculate LateOut based on custom schedule if available
    CASE
        WHEN sce.PersonalProfileId IS NOT NULL AND sce.Title = DATENAME(WEEKDAY, ci.At) THEN
            CASE
                WHEN CONVERT(TIME, ci.outAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') >
                     DATEADD(MINUTE, sce.AfternoonEnd * 60, CAST('00:00' AS TIME))
                    THEN DATEDIFF(MINUTE,
                                  DATEADD(MINUTE, sce.AfternoonEnd * 60, CAST('00:00' AS TIME)),
                                  CONVERT(TIME, ci.outAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time'))
                ELSE 0
                END
        ELSE ci.LateOut
        END AS LateOut,
    CONVERT(DATETIME2, ci.inAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') AS inAt,
    CONVERT(DATETIME2, ci.outAt AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') AS outAt,
    ci.Wt,
    CONVERT(DATETIME2, ci.At AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') AS At,
    ci.FullName,
    ci.Data
                FROM Dynamic.DataOnly_APIaCheckIn ci
                LEFT JOIN Staff s ON ci.UserId = s.Email
                LEFT JOIN CustomSchedule sce ON sce.PersonalProfileId = s.PersonalProfileId AND sce.Title = DATENAME(WEEKDAY, ci.At)
                WHERE (@UserId IS NULL OR ci.userId IN @UserIds)
                AND CONVERT(DATETIME2, ci.At AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') >= @StartDate
                AND CONVERT(DATETIME2, ci.At AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') <= @EndDate
                ORDER BY CONVERT(DATETIME2, ci.At AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') DESC
                OFFSET @Skip ROWS
                FETCH NEXT @PageSize ROWS ONLY";
            
            var attendances = await _context.Database.GetDbConnection().QueryAsync<DetailAttendance>(
                sql,
                new { 
                    UserIds = filteredUserIds, 
                    StartDate = startDate, 
                    EndDate = endDate, 
                    UserId = userId,
                    Skip = skip,
                    PageSize = pageSize
                });
            
            // Convert UTC dates to UTC+7 for each item in the result
            var items = attendances.ToList();
            
            // Create and return the paginated result
            return new PaginatedResult<DetailAttendance>
            {
                Items = items,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };
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