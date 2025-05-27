# Frontend build stage
FROM node:20-alpine AS frontend-build
WORKDIR /app

# Copy package files first for better caching
COPY calendarwebsite.client/package*.json ./

# Install dependencies with a specific registry and clean cache
RUN npm install --registry=https://registry.npmjs.org/ && \
    npm cache clean --force

# Copy the rest of the frontend code
COPY calendarwebsite.client/ .

# Set production environment and build
ENV NODE_ENV=production
RUN npm run build

# Backend build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build

# Install Node.js in the backend build stage
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /src

# Copy project files first for better caching
COPY CalendarWebsite.Server/CalendarWebsite.Server.csproj CalendarWebsite.Server/
COPY calendarwebsite.client/calendarwebsite.client.esproj calendarwebsite.client/

# Restore dependencies
RUN dotnet restore "CalendarWebsite.Server/CalendarWebsite.Server.csproj"

# Copy the rest of the source code
COPY CalendarWebsite.Server/ CalendarWebsite.Server/
COPY calendarwebsite.client/ calendarwebsite.client/

# Copy built frontend to wwwroot before building backend
COPY --from=frontend-build /app/dist CalendarWebsite.Server/wwwroot/

WORKDIR "/src/CalendarWebsite.Server"

# Build and publish the backend (skip frontend build since we already have it)
RUN dotnet build "CalendarWebsite.Server.csproj" -c Release -o /app/build --property:SpaProxyServerUrl="" --property:BuildReactApp=false && \
    dotnet publish "CalendarWebsite.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false --property:SpaProxyServerUrl="" --property:BuildReactApp=false

# Final runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy the published application (includes wwwroot with React app)
COPY --from=backend-build /app/publish .

# Set environment variables for production
ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://+:$PORT

# Expose the port (Render assigns this dynamically)
EXPOSE $PORT

# Add healthcheck (use PORT environment variable)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl --fail http://localhost:$PORT/health || exit 1

# Set the entrypoint
ENTRYPOINT ["dotnet", "CalendarWebsite.Server.dll"]