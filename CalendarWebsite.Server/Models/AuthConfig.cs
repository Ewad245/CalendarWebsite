namespace CalendarWebsite.Server.Models
{
    public class AuthConfig
    {
        public string Authority { get; set; } = string.Empty;
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public string ResponseType { get; set; } = "code";
        public string Scope { get; set; } = "openid profile email";
        public bool SaveTokens { get; set; } = true;
        public bool GetClaimsFromUserInfoEndpoint { get; set; } = true;
    }
}