# --- Stage 1: Frontend ---
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY calendarwebsite.client/package*.json ./
RUN npm ci --registry=https://registry.npmjs.org/ 
COPY calendarwebsite.client/ .
RUN npm run build

# --- Stage 2: Backend ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src

# Copy ONLY the csproj and restore
COPY ["CalendarWebsite.Server/CalendarWebsite.Server.csproj", "CalendarWebsite.Server/"]
RUN dotnet restore "CalendarWebsite.Server/CalendarWebsite.Server.csproj"

# Copy remaining files
COPY CalendarWebsite.Server/ CalendarWebsite.Server/

# Copy the ALREADY BUILT frontend from Stage 1
COPY --from=frontend-build /app/dist /src/CalendarWebsite.Server/wwwroot/

WORKDIR "/src/CalendarWebsite.Server"

# Build and Publish without trying to trigger a Node build inside .NET
RUN dotnet publish "CalendarWebsite.Server.csproj" -c Release -o /app/publish \
    /p:UseAppHost=false \
    /p:BuildServerSideRenderer=false \
    /p:BuildReactApp=false

# --- Stage 3: Final ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=backend-build /app/publish .

# Render handles the PORT env variable automatically
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "CalendarWebsite.Server.dll"]