using System.Collections.Generic;

namespace CalendarWebsite.Server.Models
{
    /// <summary>
    /// Generic class for paginated API responses
    /// </summary>
    /// <typeparam name="T">The type of items in the paginated result</typeparam>
    public class PaginatedResult<T>
    {
        /// <summary>
        /// The items for the current page
        /// </summary>
        public IEnumerable<T> Items { get; set; } = new List<T>();

        /// <summary>
        /// Current page number (1-based)
        /// </summary>
        public int PageNumber { get; set; }

        /// <summary>
        /// Number of items per page
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Total number of items across all pages
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// Total number of pages
        /// </summary>
        public int TotalPages { get; set; }

        /// <summary>
        /// Whether there is a previous page available
        /// </summary>
        public bool HasPreviousPage => PageNumber > 1;

        /// <summary>
        /// Whether there is a next page available
        /// </summary>
        public bool HasNextPage => PageNumber < TotalPages;
    }
}