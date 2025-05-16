using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendarWebsite.Server.Services;

public interface IReportService
{
    /// <summary>
    /// Generates a check-in/check-out report for a staff member
    /// </summary>
    /// <param name="staffId">The ID of the staff member</param>
    /// <returns>The Excel report file as an ActionResult</returns>
    Task<(byte[] FileContents, string FileName)> GenerateCheckInOutReportAsync(int staffId);
    
    /// <summary>
    /// Gets filtered attendance records without pagination
    /// </summary>
    /// <param name="departmentId">Optional department ID filter</param>
    /// <param name="positionId">Optional position ID filter</param>
    /// <param name="userId">Optional user ID filter</param>
    /// <param name="fromDate">Optional start date filter</param>
    /// <param name="toDate">Optional end date filter</param>
    /// <returns>Collection of filtered attendance records</returns>
    Task<(byte[] FileContents, string FileName)> GenerateCheckInOutFilteredReportAsync(
        long? departmentId, 
        long? positionId, 
        string? userId, 
        DateTime? fromDate, 
        DateTime? toDate);
}