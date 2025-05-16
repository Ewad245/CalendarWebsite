using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.Repositories;

public class PersonalProfileRepository : GenericRepository<UserInfo>, IPersonalProfileRepository
{
    public PersonalProfileRepository(DatabaseContext context) : base(context)
    {
    }

    public async Task<IEnumerable<CustomUserInfo>> GetUsersAsync()
    {
        string sql = @"
            WITH RankedEmails AS (
                SELECT *,
                       ROW_NUMBER() OVER (PARTITION BY [p].Email ORDER BY [p].Id) AS rn
                FROM [dbo].[PersonalProfile] as [p] WHERE [p].UserStatus <> -1 AND [p].IsDeleted = 0
            )
            SELECT Id, Email, FullName, DepartmentId, PositionId
            FROM RankedEmails
            WHERE rn = 1";
            
        return await _context.Set<CustomUserInfo>().FromSqlRaw(sql).ToListAsync();
    }

    public async Task<IEnumerable<CustomUserInfo>> GetUsersByDepartmentIdOrPositionIdAsync(long departmentId, long positionId)
    {
        var query = _context.Set<UserInfo>().Select(u => new CustomUserInfo()
        {
            Id = u.Id,
            Email = u.Email,
            FullName = u.FullName,
            DepartmentId = u.DepartmentId,
            PositionId = u.PositionId,
        });
        
        if (departmentId != -1)
        {
            query = query.Where(u => u.DepartmentId == departmentId);
        }
        if (positionId != -1)
        {
            query = query.Where(u => u.PositionId == positionId);
        }
        
        return await query.ToListAsync();
        
    }
}