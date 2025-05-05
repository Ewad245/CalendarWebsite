using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendarWebsite.Server.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IAttendanceRepository _attendanceRepository;

        public AttendanceService(IAttendanceRepository attendanceRepository)
        {
            _attendanceRepository = attendanceRepository;
        }

        public async Task<IEnumerable<CustomUserInfo>> GetUsersAsync()
        {
            return await _attendanceRepository.GetUsersAsync();
        }

        public async Task<IEnumerable<DetailAttendance>> GetAttendancesByUserIdAsync(string userId)
        {
            return await _attendanceRepository.GetAttendancesByUserIdAsync(userId);
        }

        public async Task<int> GetAttendanceCountByUserIdAsync(string userId)
        {
            return await _attendanceRepository.GetAttendanceCountByUserIdAsync(userId);
        }

        public async Task<PaginatedResult<DetailAttendance>> GetPaginatedAttendancesByUserIdAsync(
            string userId, 
            int pageNumber, 
            int pageSize, 
            DateTime? fromDate, 
            DateTime? toDate)
        {
            return await _attendanceRepository.GetPaginatedAttendancesByUserIdAsync(
                userId, pageNumber, pageSize, fromDate, toDate);
        }

        public async Task<PaginatedResult<DetailAttendance>> GetAllPaginatedAttendancesAsync(
            int pageNumber, 
            int pageSize, 
            DateTime? fromDate, 
            DateTime? toDate)
        {
            return await _attendanceRepository.GetAllPaginatedAttendancesAsync(
                pageNumber, pageSize, fromDate, toDate);
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
            return await _attendanceRepository.GetFilteredAttendancesAsync(
                departmentId, positionId, userId, pageNumber, pageSize, fromDate, toDate);
        }
    }
}