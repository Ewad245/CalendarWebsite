using CalendarWebsite.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CalendarWebsite.Server.Repositories
{
    public static class PaginationHelper
    {
        public static async Task<PaginatedResult<T>> CreatePaginatedResultAsync<T>(
            IQueryable<T> query,
            int pageNumber,
            int pageSize) where T : class
        {
            // Validate pagination parameters
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100; // Limit maximum page size
            
            // Get total count for pagination metadata
            var totalCount = await query.CountAsync();
            
            if (totalCount == 0)
            {
                return new PaginatedResult<T>
                {
                    Items = Array.Empty<T>(),
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalCount = 0,
                    TotalPages = 0
                };
            }
            
            // Calculate total pages
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            
            // Apply pagination
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            // Create and return the paginated result
            return new PaginatedResult<T>
            {
                Items = items,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };
        }
    }
}