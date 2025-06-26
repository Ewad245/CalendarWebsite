using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;
using CalendarWebsite.Server.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;
using Microsoft.Extensions.FileProviders;

namespace CalendarWebsite.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://*:{port}");

            // Add services to the container
            builder.Services.AddControllers();
            // Configure forwarded headers BEFORE authentication
            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | 
                                           ForwardedHeaders.XForwardedProto | 
                                           ForwardedHeaders.XForwardedHost;
    
                // Trust all proxies (for cloud platforms like Render)
                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();
            });
            builder.Services.AddOpenApi();

            // Configure authentication
            var authConfig = builder.Configuration.GetSection("Authentication").Get<AuthConfig>()
                ?? throw new InvalidOperationException("Authentication configuration is missing.");

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
            })
            .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
            {
                options.ExpireTimeSpan = TimeSpan.FromDays(30);
                options.Cookie.Name = "AttendanceView.Auth";
                options.SlidingExpiration = true;
                options.Cookie.IsEssential = true;
                options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.None;
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Events.OnSigningIn = (context) =>
                {
                    context.CookieOptions.Expires = DateTimeOffset.UtcNow.AddDays(30);
                    return Task.CompletedTask;
                };

                options.Events.OnSigningOut = context =>
                {
                    var cookieNames = new[] { "AttendanceView.Auth", "AttendanceView.AuthC1", "AttendanceView.AuthC2" };
                    var cookieOptions = new CookieOptions
                    {
                        Expires = DateTime.Now.AddDays(-1),
                        Path = "/",
                        Secure = true,
                        HttpOnly = true,
                        SameSite = SameSiteMode.None,
                        Domain = context.HttpContext.Request.Host.Host
                    };
                    foreach (var cookieName in cookieNames)
                    {
                        context.HttpContext.Response.Cookies.Delete(cookieName, cookieOptions);
                    }

                    return Task.CompletedTask;
                };
            })
            .AddOpenIdConnect(IdentityConstants.ApplicationScheme, options =>
            {
                options.Authority = authConfig.Authority;
                options.ClientId = authConfig.ClientId;
                options.ClientSecret = authConfig.ClientSecret;
                options.ResponseType = authConfig.ResponseType;
                options.RequireHttpsMetadata = authConfig.RequireHttpsMetadata;
                options.SaveTokens = authConfig.SaveTokens;
                options.GetClaimsFromUserInfoEndpoint = authConfig.GetClaimsFromUserInfoEndpoint;
                /*options.CallbackPath = "/signin-oidc";
                options.SignedOutCallbackPath = "/signout-callback-oidc";
                options.RemoteSignOutPath = "/signout-oidc";*/

                options.Scope.Add("openid");
                options.Scope.Add("profile");
                options.Scope.Add("email");

                options.TokenValidationParameters = new()
                {
                    NameClaimType = "name",
                    ValidateIssuer = true,
                    ValidIssuer = authConfig.Authority
                };
                options.NonceCookie.SecurePolicy = CookieSecurePolicy.Always;
                options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;

                options.Events = new OpenIdConnectEvents
                {
                    OnRedirectToIdentityProvider = context =>
                    {
                        if (context.Request.Headers.ContainsKey("X-Forwarded-Proto"))
                        {
                            context.ProtocolMessage.RedirectUri = context.ProtocolMessage.RedirectUri.Replace("http://", "https://");
                        }
                        Console.WriteLine($"Redirecting to IdP with ReturnUrl: {context.Properties.RedirectUri}");
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine($"Token validated, redirecting to: {context.Properties.RedirectUri}");
                        return Task.CompletedTask;
                    },
                    OnRedirectToIdentityProviderForSignOut = context =>
                    {
                        context.ProtocolMessage.PostLogoutRedirectUri = context.HttpContext.Request.Scheme + "://" + context.HttpContext.Request.Host + "/signout-callback-oidc";
                        context.ProtocolMessage.IdTokenHint = context.HttpContext.GetTokenAsync("id_token").Result;
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        context.HandleResponse();
                        context.Response.Redirect("/Error?message=" + Uri.EscapeDataString(context.Exception.Message));
                        return Task.CompletedTask;
                    }
                };
            });

            builder.Services.AddAuthorization();

            builder.Services.AddDbContext<DatabaseContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Register repositories and services
            builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();
            builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
            builder.Services.AddScoped<IPositionRepository, PositionRepository>();
            builder.Services.AddScoped<IReportRepository, ReportRepository>();
            builder.Services.AddScoped<IPersonalProfileRepository, PersonalProfileRepository>();
            builder.Services.AddScoped<IWorkWeekRepository, WorkWeekRepository>();
            builder.Services.AddScoped<ICustomWorkingTimeRepository, CustomWorkingTimeRepository>();
            
            // Register services
            builder.Services.AddScoped<IAttendanceService, AttendanceService>();
            builder.Services.AddScoped<IDepartmentService, DepartmentService>();
            builder.Services.AddScoped<IPositionService, PositionService>();
            builder.Services.AddScoped<IReportService, ReportService>();
            builder.Services.AddScoped<IPersonalProfileService, PersonalProfileService>();
            builder.Services.AddScoped<IWorkWeekService, WorkWeekService>();
            builder.Services.AddScoped<ICustomWorkingTimeService, CustomWorkingTimeService>();
            
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
    
                // Add cookie authentication support
                c.AddSecurityDefinition("cookieAuth", new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.ApiKey,
                    In = ParameterLocation.Cookie,
                    Name = "AttendanceView.Auth", // Default cookie name
                    Description = "Enter the authentication cookie"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference 
                            { 
                                Type = ReferenceType.SecurityScheme, 
                                Id = "cookieAuth" 
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            builder.Services.AddAutoMapper(typeof(Program));
            
            var allowedDomainSuffix = "https://*.vntts.vn";
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder.AllowAnyMethod()
                        .AllowAnyHeader()
                        .WithOrigins(
                            "https://localhost:44356",
                            "https://localhost:44357",
                            "https://identity.vntts.vn"
                        )
                        .SetIsOriginAllowedToAllowWildcardSubdomains()
                        .AllowCredentials());
            });

            var app = builder.Build();
            // Use forwarded headers FIRST - this is critical
            app.UseForwardedHeaders();
            app.UseCors("CorsPolicy");
            app.UseDefaultFiles();
            app.MapStaticAssets();
            //app.UseHttpsRedirection();

            if (app.Environment.IsDevelopment())
            {
                app.MapScalarApiReference();
                app.MapOpenApi();
            }
            
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseSpaAuthentication();
            app.MapControllers();
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
                c.OAuthUsePkce();
                c.ConfigObject.AdditionalItems["requestSnippetsEnabled"] = true;
                c.ConfigObject.AdditionalItems["filter"] = true;
                c.ConfigObject.AdditionalItems["withCredentials"] = true; // Important for cookies
            });

            app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
            var spaPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
if (Directory.Exists(spaPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(spaPath)
    });
    
    // This handles all other routes by serving the SPA's index.html
    app.MapFallbackToFile("index.html", new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(spaPath)
    });
}

            app.Run();
            
            
        }
    }
}
