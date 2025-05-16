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

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
# Install Node.js for the .NET build
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /src
# Copy and restore project files first for better caching
COPY CalendarWebsite.Server/CalendarWebsite.Server.csproj CalendarWebsite.Server/
RUN dotnet restore "CalendarWebsite.Server/CalendarWebsite.Server.csproj"
# Copy the rest of the backend code
COPY . .
WORKDIR "/src/CalendarWebsite.Server"
# Build and publish with specific configuration
RUN dotnet build "CalendarWebsite.Server.csproj" -c Release -o /app/build && \
    dotnet publish "CalendarWebsite.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
# Copy the published backend
COPY --from=backend-build /app/publish .
# Copy the built frontend
COPY --from=frontend-build /app/dist /app/wwwroot
# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://+:5194
# Expose the port
EXPOSE 5194
# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl --fail http://localhost:5194/health || exit 1
# Set the entrypoint
ENTRYPOINT ["dotnet", "CalendarWebsite.Server.dll"] 