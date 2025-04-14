﻿using CalendarWebsite.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.Data
{
    public class UserDataContext(DbContextOptions<UserDataContext> options) : DbContext(options)
    {
        public DbSet<DataOnly_APIaCheckIn> Users { get; set; }
    }
}
