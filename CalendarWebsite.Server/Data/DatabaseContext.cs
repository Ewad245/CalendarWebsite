using CalendarWebsite.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.Data
{
    public class DatabaseContext(DbContextOptions<DatabaseContext> options) : DbContext(options)
    {
        public DbSet<DetailAttendance> Attendances { get; set; }
        public DbSet<UserInfo> Users { get; set; }
        public DbSet<CustomUserInfo> CustomUserInfos { get; set; }
        public DbSet<DetailAttendanceDTOExcel> DetailAttendancesDtoExcel { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Position> Positions { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DetailAttendanceDTOExcel>().HasNoKey();
        }
        
    }
}
