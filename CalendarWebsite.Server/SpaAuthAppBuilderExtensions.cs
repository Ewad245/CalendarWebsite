using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;

namespace CalendarWebsite.Server;

public static class SpaAuthAppBuilderExtensions
{
    public static IApplicationBuilder UseSpaAuthentication(this IApplicationBuilder app)
    {
        return app == null ? throw new ArgumentNullException(nameof(app)) : app.UseMiddleware<SpaAuthMiddleware>();
    }
    
    internal class SpaAuthMiddleware(RequestDelegate next)
    {
        private readonly RequestDelegate _next = next ?? throw new ArgumentNullException(nameof(next));

        public async Task Invoke(HttpContext context)
        {
            var request = context.Request;
            if (context.User.Identity != null && !context.User.Identity.IsAuthenticated)
            {
                // context.Response.StatusCode = 401;
                await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                await context.SignOutAsync(IdentityConstants.ApplicationScheme);
                await context.SignOutAsync();
                await context.ChallengeAsync();
                // await Task.CompletedTask;
            }
            else
            {                
                await _next(context);                
            }
        }
    }
}