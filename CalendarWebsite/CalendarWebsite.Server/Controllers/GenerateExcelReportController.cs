using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;
using ClosedXML.Report;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.Controllers;

[Route("api/[controller]")]
    [ApiController]
    public class GenerateExcelReport : ControllerBase
    {
        private readonly UserDataContext _dbContext;
        private readonly string _templatePath;

        public GenerateExcelReport(UserDataContext dbContext, IWebHostEnvironment env)
        {
            _dbContext = dbContext;
            _templatePath = Path.Combine(env.ContentRootPath, "Templates", "TemplateCheckInOut1.xlsx");
        }

        [HttpGet("generate-checkinout-report/{staffId}")]
        public async Task<IActionResult> GenerateCheckInOutReport(int staffId)
        {
            string sql =
                @"SELECT TOP(1) [p].[Id], [p].Email, [p].FullName FROM [dbo].[PersonalProfile] AS [p] WHERE [p].[Id] = @staffId";
            // Fetch staff details
            var staffs = await _dbContext.CustomUserInfos.FromSqlRaw(sql, new SqlParameter("@staffId", staffId) ).ToListAsync();
            CustomUserInfo staff = staffs.First();

            string staffEmail = staff?.Email ?? string.Empty;

            if (staff == null)
            {
                return NotFound("Staff member not found.");
            }
            
            // Debug the staff email before query
            Console.WriteLine($"Looking for records with staff email: {staffEmail}");
            
            string sql2 = @"
            SELECT
                    ROW_NUMBER() OVER (ORDER BY [d].Id) AS rowNum,
                    CAST([d].[At] AS date) AS workingDate,
                    [d].[InAt],
                    [d].[OutAt],
                    [d].[Method],
                    [d].[Check],
                    [d].[EarlyIn],
                    [d].[LateIn],
                    [d].[EarlyOut],
                    [d].[LateOut],
                    [d].[Wt]
            FROM [Dynamic].[DataOnly_APIaCheckIn] AS [d] WHERE [d].[UserId] = @staffEmail";

            // Query check-in/check-out data for the staff
            var reportData = await _dbContext.DetailAttendancesDtoExcel
                .FromSqlRaw(sql2, new SqlParameter("@staffEmail", staffEmail) )
                .ToListAsync();

            // Debug information
            Console.WriteLine($"Staff Email used in query: {staffEmail}");
            Console.WriteLine($"Number of records found: {reportData.Count}");
            
            if (reportData.Count == 0)
            {
                return NotFound($"No attendance records found for staff with email: {staffEmail}");
            }

            // Generate report
            Console.WriteLine($"First record date: {reportData.First().RowNum}");
            using var template = new XLTemplate(_templatePath);
            template.AddVariable("staff", staff); // Single staff object for {{staff.Name}}
            template.AddVariable("items", reportData); // List of check-in/check-out records
            template.AddVariable("reportDate", DateTime.Now.ToString("MM/dd/yyyy"));
            template.Generate();

            // Save to memory stream
            using var stream = new MemoryStream();
            template.SaveAs(stream);
            stream.Position = 0;

            // Return file
            return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"checkinout_report_{staff.FullName}.xlsx");
        }
    }