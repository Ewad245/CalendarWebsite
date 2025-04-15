using CalendarWebsite.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.Data
{
    public class UserDataContext(DbContextOptions<UserDataContext> options) : DbContext(options)
    {
        public DbSet<DetailAttendance> Attendances { get; set; }
        public DbSet<UserInfo> Users { get; set; }
        public DbSet<CustomUserInfo> CustomUserInfos { get; set; }
    }
}
