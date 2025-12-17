using System.Runtime.InteropServices.JavaScript;
using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.Repositories;

public class ReportRepository : GenericRepository<DetailAttendanceDTOExcel>, IReportRepository
{
    public ReportRepository(DatabaseContext dbContext) : base(dbContext)
    {
    }

    public async Task<CustomUserInfo?> GetStaffByIdAsync(int staffId)
    {
        string sql = @"SELECT TOP(1) [p].[Id], [p].Email, [p].FullName, [p].departmentId, [p].positionId FROM [dbo].[PersonalProfile] AS [p] WHERE [p].[Id] = @staffId";
        var staffs = await _context.CustomUserInfos.FromSqlRaw(sql, new SqlParameter("@staffId", staffId)).ToListAsync();
        
        return staffs.FirstOrDefault();
    }

    public async Task<List<DetailAttendanceDTOExcel>> GetAttendanceRecordsByEmailAsync(string staffEmail, DateTime startDate, DateTime endDate)
    {
        string sql = @"
            SELECT
                    ROW_NUMBER() OVER (ORDER BY [d].Id) AS rowNum,
                    CAST(DATEADD(HOUR, 7, [d].[At]) AS date) AS workingDate,
                    DATEADD(HOUR, 7, [d].[InAt]) AS InAt,
                    DATEADD(HOUR, 7, [d].[OutAt]) AS OutAt,
                    [d].[Method],
                    [d].[Check],
                    [d].[EarlyIn],
                    [d].[LateIn],
                    [d].[EarlyOut],
                    [d].[LateOut],
                    [d].[Wt]
            FROM [Dynamic].[DataOnly_APIaCheckIn] AS [d] WHERE [d].[UserId] = @staffEmail AND [d].[At] >= @startDate AND [d].[At] <= @endDate";

        return await _context.DetailAttendancesDtoExcel
            .FromSqlRaw(sql, new SqlParameter("@staffEmail", staffEmail), new SqlParameter("@startDate", startDate), new SqlParameter("@endDate", endDate))
            .ToListAsync();
    }
    
    public async Task<IEnumerable<DetailAttendanceDtoFilterExcel>> GetFilteredAttendancesWithoutPaginationAsync(
        long? departmentId, 
        long? positionId, 
        string? userId, 
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
        
        // Apply filters
        if (userId != null)
        {
            query = query.Where(a => a.UserId == userId);
        }
        
        if (fromDate.HasValue)
        {
            query = query.Where(a => a.At >= fromDate.Value);
        }
        
        if (toDate.HasValue)
        {
            query = query.Where(a => a.At <= toDate.Value);
        }
        
        // Join with user profiles to get department and position information
        var result = query.Join(
                _context.Users,
            attendance => attendance.UserId,
            user => user.Email,
            (attendance, user) => new { Attendance = attendance, User = user })
            .Where(joined => 
                (!departmentId.HasValue || joined.User.DepartmentId == departmentId) &&
                (!positionId.HasValue || joined.User.PositionId == positionId))
            // Join with departments to get department name
            .GroupJoin(
                _context.Departments,
                joined => joined.User.DepartmentId,
                dept => dept.Id,
                (joined, depts) => new { Joined = joined, Departments = depts })
            .SelectMany(
                x => x.Departments.DefaultIfEmpty(),
                (x, dept) => new { x.Joined, Department = dept })
            // Join with positions to get position name
            .GroupJoin(
                _context.Positions,
                x => x.Joined.User.PositionId,
                pos => pos.Id,
                (x, positions) => new { x.Joined, x.Department, Positions = positions })
            .SelectMany(
                x => x.Positions.DefaultIfEmpty(),
                (x, pos) => new DetailAttendanceDtoFilterExcel
                {
                    // Map attendance data with UTC+7 timezone adjustment
                    RowNum = 0, // Will be set after materialization
                    WorkingDate = x.Joined.Attendance.At.Value.AddHours(7),
                    InAt = x.Joined.Attendance.InAt.HasValue ? x.Joined.Attendance.InAt.Value.AddHours(7) : (DateTime?)null,
                    OutAt = x.Joined.Attendance.OutAt.HasValue ? x.Joined.Attendance.OutAt.Value.AddHours(7) : (DateTime?)null,
                    Method = x.Joined.Attendance.Method,
                    Check = x.Joined.Attendance.Check,
                    EarlyIn = x.Joined.Attendance.EarlyIn,
                    LateIn = x.Joined.Attendance.LateIn,
                    EarlyOut = x.Joined.Attendance.EarlyOut,
                    LateOut = x.Joined.Attendance.LateOut,
                    Wt = x.Joined.Attendance.Wt,
                    
                    // Map user data
                    userId = x.Joined.Attendance.UserId ?? string.Empty,
                    FullName = x.Joined.User.FullName,
                    DepartmentId = x.Joined.User.DepartmentId,
                    PositionId = x.Joined.User.PositionId,
                    DepartmentName = x.Department != null ? x.Department.Title : string.Empty,
                    PositionName = pos != null ? pos.Title : string.Empty
                });
        
        // Materialize the query results
        var resultList = await result.ToListAsync();
        
        // Add row numbers similar to GetAttendanceRecordsByEmailAsync
        for (int i = 0; i < resultList.Count; i++)
        {
            resultList[i].RowNum = i + 1;
        }
        
        return resultList;
    }
}