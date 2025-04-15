FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5194
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["CalendarWebsite.Server/CalendarWebsite.Server.csproj", "CalendarWebsite.Server/"]
RUN dotnet restore "CalendarWebsite.Server/CalendarWebsite.Server.csproj"
COPY . .
WORKDIR "/src/CalendarWebsite.Server"
RUN dotnet build "CalendarWebsite.Server.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CalendarWebsite.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CalendarWebsite.Server.dll"]