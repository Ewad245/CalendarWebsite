using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalendarWebsite.Server.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _departmentRepository;

        public DepartmentService(IDepartmentRepository departmentRepository)
        {
            _departmentRepository = departmentRepository;
        }

        public async Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync()
        {
            return await _departmentRepository.GetAllDepartmentsAsync();
        }
    }
}