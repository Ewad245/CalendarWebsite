using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;
using ClosedXML.Report;

namespace CalendarWebsite.Server.Services;

public class ReportService : IReportService
{
    private readonly IReportRepository _reportRepository;
    private string _templatePath;

    public ReportService(IReportRepository reportRepository, IWebHostEnvironment env)
    {
        _reportRepository = reportRepository;
        _templatePath = Path.Combine(env.ContentRootPath, "Templates");
    }

    public async Task<(byte[] FileContents, string FileName)> GenerateCheckInOutReportAsync(int staffId)
    {
        // Get staff information
        var staff = await _reportRepository.GetStaffByIdAsync(staffId);
        if (staff == null)
        {
            throw new KeyNotFoundException("Staff member not found.");
        }

        string staffEmail = staff.Email ?? string.Empty;
        
        // Debug the staff email before query
        Console.WriteLine($"Looking for records with staff email: {staffEmail}");
        
        // Get attendance records
        var reportData = await _reportRepository.GetAttendanceRecordsByEmailAsync(staffEmail);
        
        // Debug information
        Console.WriteLine($"Staff Email used in query: {staffEmail}");
        Console.WriteLine($"Number of records found: {reportData.Count}");
        
        if (reportData.Count == 0)
        {
            throw new KeyNotFoundException($"No attendance records found for staff with email: {staffEmail}");
        }

        // Generate report
        Console.WriteLine($"First record date: {reportData.First().RowNum}");
        _templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "TemplateCheckInOut1.xlsx");
        using var template = new XLTemplate(_templatePath);
        template.AddVariable("staff", staff); // Single staff object for {{staff.Name}}
        template.AddVariable("items", reportData); // List of check-in/check-out records
        template.AddVariable("reportDate", DateTime.Now.ToString("dd/MM/yyyy"));
        template.Generate();

        // Save to memory stream
        using var stream = new MemoryStream();
        template.SaveAs(stream);
        stream.Position = 0;

        // Return file contents and name
        return (stream.ToArray(), $"checkinout_report_{staff.FullName}.xlsx");
    }
    
    public async Task<(byte[] FileContents, string FileName)> GenerateCheckInOutFilteredReportAsync(
        long? departmentId, 
        long? positionId, 
        string? userId, 
        DateTime? fromDate, 
        DateTime? toDate)
    {
        var reportData = await _reportRepository.GetFilteredAttendancesWithoutPaginationAsync(
            departmentId, positionId, userId, fromDate, toDate);
        
        if (reportData == null)
        {
            throw new KeyNotFoundException("Data not found");
        }
        var _templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "TemplateCheckInOut2.xlsx");
        using var template = new XLTemplate(_templatePath);
        if (fromDate != null && toDate != null) {
            template.AddVariable("fromDate", fromDate.Value.ToString("dd/MM/yyyy"));
            template.AddVariable("toDate", toDate.Value.ToString("dd/MM/yyyy"));
        }
        template.AddVariable("items", reportData); // List of check-in/check-out records
        template.AddVariable("reportDate", DateTime.Now.ToString("dd/MM/yyyy"));
        template.Generate();
        // Save to memory stream
        using var stream = new MemoryStream();
        template.SaveAs(stream);
        stream.Position = 0;

        return (stream.ToArray(), $"checkinout_report.xlsx");
    }
}