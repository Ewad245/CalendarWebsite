using System;
using System.Collections.Generic;

namespace CalendarWebsite.Server.Models
{
    public class AttendanceWithAbsentDTO
    {
        // Original attendance properties
        public long? Id { get; set; }
        public string? UserId { get; set; }
        public DateTime? At { get; set; }
        public DateTime? InAt { get; set; }
        public DateTime? OutAt { get; set; }
        public string? FullName { get; set; }
        
        // Additional properties for absence tracking
        public bool IsAbsent { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public int Day { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal? EarlyIn { get; set; }
        public decimal? LateIn { get; set; }
        public decimal? EarlyOut { get; set; }
        public decimal? LateOut { get; set; }
        
        // Static method to create from DetailAttendance
        public static AttendanceWithAbsentDTO FromDetailAttendance(DetailAttendance attendance)
        {
            return new AttendanceWithAbsentDTO
            {
                Id = attendance.Id,
                UserId = attendance.UserId,
                At = attendance.At,
                InAt = attendance.InAt,
                OutAt = attendance.OutAt,
                FullName = attendance.FullName,
                IsAbsent = false,
                Day = attendance.At?.Day ?? 0,
                Month = attendance.At?.Month ?? 0,
                Year = attendance.At?.Year ?? 0,
                DayOfWeek = attendance.At?.DayOfWeek ?? DayOfWeek.Sunday,
                EarlyIn = attendance.EarlyIn,
                LateIn = attendance.LateIn,
                EarlyOut = attendance.EarlyOut,
                LateOut = attendance.LateOut,
            };
        }
        
        // Static method to create an absent record
        public static AttendanceWithAbsentDTO CreateAbsentRecord(string userId, string fullName, DateTime date)
        {
            return new AttendanceWithAbsentDTO
            {
                UserId = userId,
                FullName = fullName,
                At = date,
                IsAbsent = true,
                Day = date.Day,
                Month = date.Month,
                Year = date.Year,
                DayOfWeek = date.DayOfWeek
            };
        }
    }
}