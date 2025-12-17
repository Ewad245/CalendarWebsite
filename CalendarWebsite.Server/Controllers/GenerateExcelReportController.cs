using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CalendarWebsite.Server.Controllers;
[Authorize]
[Route("api/[controller]")]
    [ApiController]
    public class GenerateExcelReport : ControllerBase
    {
        private readonly IReportService _reportService;

        public GenerateExcelReport(IReportService reportService)
        {
            _reportService = reportService;
        }
        
        //GET: api/GenerateExcelReport/generate-checkinout-report/1
        [HttpGet("generate-checkinout-report/{staffId}")]
        public async Task<IActionResult> GenerateCheckInOutReport(int staffId,
        [FromQuery] int month,
        [FromQuery] int year)
        {
            try
            {
                var (fileContents, fileName) = await _reportService.GenerateCheckInOutReportAsync(staffId, month, year);
                return File(fileContents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error generating report: {ex.Message}");
                return StatusCode(500, "An error occurred while generating the report.");
            }
        }

        //GET: api/GenerateExcelReport/generate-filter-report?departmentId=1&positionId=2&userId=3&fromDate=2023-01-01&toDate=2023-12-31
        [HttpGet("generate-filter-report")]
        public async Task<IActionResult> GenerateReport(
            [FromQuery] long? departmentId,
            [FromQuery] long? positionId, 
            [FromQuery] string? userId,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            try
            {
                var (fileContents, fileName) =
                    await _reportService.GenerateCheckInOutFilteredReportAsync(departmentId, positionId, userId,
                        fromDate, toDate);
                return File(fileContents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error generating report: {ex.Message}");
                return StatusCode(500, "An error occurred while generating the report.");
            }
        }
    }