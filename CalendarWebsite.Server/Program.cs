using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;
using CalendarWebsite.Server.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;

namespace CalendarWebsite.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();

            // Configure authentication
            var authConfig = builder.Configuration.GetSection("Authentication").Get<AuthConfig>()
                ?? throw new InvalidOperationException("Authentication configuration is missing.");

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
            .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
            {
                options.Cookie.Name = "CalendarWebsite.Server.Auth";
                options.Cookie.SameSite = SameSiteMode.None;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.IsEssential = true;
            })
            .AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
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
            builder.Services.AddScoped<IAttendanceService, AttendanceService>();
            builder.Services.AddScoped<IDepartmentService, DepartmentService>();
            builder.Services.AddScoped<IPositionService, PositionService>();
            builder.Services.AddScoped<IReportService, ReportService>();
            builder.Services.AddScoped<IPersonalProfileService, PersonalProfileService>();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
                c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.OAuth2,
                    Flows = new OpenApiOAuthFlows
                    {
                        AuthorizationCode = new OpenApiOAuthFlow
                        {
                            AuthorizationUrl = new Uri($"{authConfig.Authority}/connect/authorize"),
                            TokenUrl = new Uri($"{authConfig.Authority}/connect/token"),
                            Scopes = new Dictionary<string, string>
                            {
                                { "openid", "OpenID" },
                                { "profile", "Profile" },
                                { "email", "Email" },
                                { "role", "Role" },
                                { "EOfficeAPI", "EOffice API" }
                            }
                        }
                    }
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "oauth2" }
                        },
                        new[] { "openid", "profile", "email", "role", "EOfficeAPI" }
                    }
                });
            });

            builder.Services.AddAutoMapper(typeof(Program));

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    policy =>
                    {
                        policy.WithOrigins(
                                "https://localhost:44356",
                                "https://identity.vntts.vn")
                            .AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowCredentials();
                    });
            });

            var app = builder.Build();
            
            app.UseCors("AllowAll");
            app.UseDefaultFiles();
            app.MapStaticAssets();
            app.UseHttpsRedirection();

            if (app.Environment.IsDevelopment())
            {
                app.MapScalarApiReference();
                app.MapOpenApi();
            }
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
                c.OAuthClientId(authConfig.ClientId);
                c.OAuthClientSecret(authConfig.ClientSecret);
                // c.OAuthUsePkce(); // Optional, remove if not needed
            });

            app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
