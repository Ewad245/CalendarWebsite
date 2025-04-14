FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY calendarwebsite.client/package*.json ./
RUN npm install
COPY calendarwebsite.client/ .
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src
COPY CalendarWebsite.Server/CalendarWebsite.Server.csproj CalendarWebsite.Server/
RUN dotnet restore "CalendarWebsite.Server/CalendarWebsite.Server.csproj"
COPY . .
WORKDIR "/src/CalendarWebsite.Server"
RUN dotnet build "CalendarWebsite.Server.csproj" -c Release -o /app/build
RUN dotnet publish "CalendarWebsite.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=backend-build /app/publish .
COPY --from=frontend-build /app/dist /app/wwwroot
EXPOSE 5194
ENTRYPOINT ["dotnet", "CalendarWebsite.Server.dll"]