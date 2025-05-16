using CalendarWebsite.Server.Models;

using CalendarWebsite.Server.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendarWebsite.Server.Repositories;

public interface IReportRepository : IGenericRepository<DetailAttendanceDTOExcel>
{
    /// <summary>
    /// Gets staff information by ID
    /// </summary>
    /// <param name="staffId">The ID of the staff member</param>
    /// <returns>Staff information</returns>
    Task<CustomUserInfo?> GetStaffByIdAsync(int staffId);
    
    /// <summary>
    /// Gets attendance records for a staff member by email
    /// </summary>
    /// <param name="staffEmail">The email of the staff member</param>
    /// <returns>List of attendance records</returns>
    Task<List<DetailAttendanceDTOExcel>> GetAttendanceRecordsByEmailAsync(string staffEmail);
    
    /// <summary>
    /// Gets filtered attendance records without pagination
    /// </summary>
    /// <param name="departmentId">Optional department ID filter</param>
    /// <param name="positionId">Optional position ID filter</param>
    /// <param name="userId">Optional user ID filter</param>
    /// <param name="fromDate">Optional start date filter</param>
    /// <param name="toDate">Optional end date filter</param>
    /// <returns>Collection of filtered attendance records with department and position information</returns>
    Task<IEnumerable<DetailAttendanceDtoFilterExcel>> GetFilteredAttendancesWithoutPaginationAsync(
        long? departmentId, 
        long? positionId, 
        string? userId, 
        DateTime? fromDate, 
        DateTime? toDate);
}