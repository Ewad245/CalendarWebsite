using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace CalendarWebsite.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;

        public AuthController(ILogger<AuthController> logger)
        {
            _logger = logger;
        }

        [HttpGet("login")]
        public IActionResult Login(string returnUrl = "/")
        {
            return Challenge(new AuthenticationProperties { RedirectUri = returnUrl },CookieAuthenticationDefaults.AuthenticationScheme,
                IdentityConstants.ApplicationScheme);
        }
        
        [AllowAnonymous]
        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
            var callbackUrl = "/";
            
            if (User?.Identity != null && User?.Identity.IsAuthenticated == true)
            {
                // Sign out from both cookie authentication and OpenID Connect
                return SignOut(new AuthenticationProperties
                {
                    RedirectUri = callbackUrl
                },
                CookieAuthenticationDefaults.AuthenticationScheme,
                IdentityConstants.ApplicationScheme);
            }
            else
            {
                // User is not authenticated, just redirect to home
                return Redirect(callbackUrl);
            }
        }

        [HttpGet("user")]
        [Authorize]
        public IActionResult GetUser()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value });
            
            var userInfo = new
            {
                IsAuthenticated = User.Identity?.IsAuthenticated ?? false,
                Name = User.FindFirst(ClaimTypes.Name)?.Value,
                Email = User.FindFirst(ClaimTypes.Email)?.Value,
                Claims = claims
            };

            return Ok(userInfo);
        }
    }
}