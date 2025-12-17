Here is a comprehensive `README.md` file for your **CalendarWebsite** project, based on the codebase analysis.

---

# CalendarWebsite

A comprehensive **Attendance and Calendar Management System** built with **ASP.NET Core 9.0** and **React**. This application allows organizations to manage staff attendance, view schedules, track working hours, and generate reports with a modern, responsive user interface.

## 🚀 Key Features

- **📅 Interactive Calendar**: Visual day, week, and month views using [FullCalendar](https://fullcalendar.io/).
- **✅ Attendance Tracking**:
- Check-in / Check-out functionality.
- Automatic status calculation (Early, On Time, Late).
- Leave and Absence management.

- **📊 Reporting**:
- Export attendance data to Excel.
- Detailed attendance tables with filtering (by Date, User, Department, Position).

- **👥 Staff Management**: Manage Departments, Positions, and Staff profiles.
- **⚙️ Customization**:
- Configurable working hours (Standard & Custom).
- **Dark Mode** / Light Mode support.
- **Multilingual Support** (English & Vietnamese).

- **🔒 Security**: Authentication and Authorization (OIDC integration).

## 🛠️ Tech Stack

### Frontend (`calendarwebsite.client`)

- **Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) / shadcn-ui
- **State/Data**: React Context, Hooks
- **Internationalization**: i18next

### Backend (`CalendarWebsite.Server`)

- **Framework**: [ASP.NET Core 9.0](https://dotnet.microsoft.com/en-us/apps/aspnet) (C#)
- **Database**: SQL Server (Entity Framework Core)
- **API**: RESTful API Controllers
- **Documentation**: Swagger/OpenAPI (implied)

### DevOps

- **Containerization**: Docker (Multi-stage build)
- **Reverse Proxy**: Nginx (in production Docker image)

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or a compatible connection string)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

## 🏃‍♂️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CalendarWebsite.git
cd CalendarWebsite

```

### 2. Database Configuration

Update the connection string in `CalendarWebsite.Server/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=CalendarDB;Trusted_Connection=True;TrustServerCertificate=True;"
}

```

_Make sure to apply migrations to your database if they exist, or let EF Core create the database on startup (depending on `Program.cs` configuration)._

### 3. Run Locally (Development)

**Build the Frontend first:**

```bash
cd calendarwebsite.client
npm install
npm run build
```

**Copy frontend build to wwwroot:**

```bash
# Copy built frontend to server's wwwroot directory
cp -r dist/* ../CalendarWebsite.Server/wwwroot/
```

**Start the Backend:**

```bash
cd ../CalendarWebsite.Server
dotnet run
```

The application will start on `https://localhost:7152` or `http://localhost:5292` and serve both the API and the React frontend from the same server.

### 4. Run with Docker 🐳

The project includes a `Dockerfile` that builds both the React frontend and .NET backend into a single image.

```bash
# Build the image
docker build -t calendar-website .

# Run the container with all required environment variables
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e ConnectionStrings__DefaultConnection="Your_Production_Connection_String" \
  -e Authentication__Authority="https://your-identity-provider.com" \
  -e Authentication__ClientId="your-client-id" \
  -e Authentication__ClientSecret="your-client-secret" \
  -e Authentication__ResponseType="code id_token" \
  -e Authentication__RequireHttpsMetadata="true" \
  -e Authentication__SaveTokens="true" \
  -e Authentication__GetClaimsFromUserInfoEndpoint="true" \
  -e Authentication__DefaultTokenReset="your-token-reset-value" \
  -e ASPNETCORE_ENVIRONMENT="Development" \
  calendar-website
```

## 📂 Project Structure

```text
├── calendarwebsite.client/      # React Frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable UI components (Calendar, Tables, etc.)
│   │   ├── contexts/            # React Context (Auth, Theme)
│   │   ├── hooks/               # Custom hooks
│   │   ├── interfaces/          # TypeScript interfaces/types
│   │   ├── lib/                 # Utilities (API helpers, CN)
│   │   ├── locales/             # i18n translation files
│   │   └── pages/               # Application pages (Login, Attendance, etc.)
│   ├── Dockerfile               # Frontend-specific Dockerfile (if any)
│   └── vite.config.ts           # Vite configuration
│
├── CalendarWebsite.Server/      # ASP.NET Core Backend
│   ├── Controllers/             # API Endpoints
│   ├── Data/                    # EF Core DbContext
│   ├── Models/                  # Data Models & DTOs
│   ├── Repositories/            # Data Access Layer
│   ├── Services/                # Business Logic Layer
│   ├── appsettings.json         # Configuration
│   └── Program.cs               # App entry point & DI configuration
│
└── Dockerfile                   # Root Dockerfile for full stack deployment

```

## 🌐 Environment Variables

| Variable                                        | Description                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `ASPNETCORE_ENVIRONMENT`                        | Set to `Development` or `Production`.                             |
| `ConnectionStrings__DefaultConnection`          | SQL Server connection string.                                     |
| `Authentication__Authority`                     | OIDC authority URL (e.g., `https://identity.vntts.vn`).           |
| `Authentication__ClientId`                      | OIDC client identifier.                                           |
| `Authentication__ClientSecret`                  | OIDC client secret (sensitive).                                   |
| `Authentication__ResponseType`                  | OIDC response type (e.g., `code id_token`).                       |
| `Authentication__RequireHttpsMetadata`          | Whether to require HTTPS metadata (`true`/`false`).               |
| `Authentication__SaveTokens`                    | Whether to save authentication tokens (`true`/`false`).           |
| `Authentication__GetClaimsFromUserInfoEndpoint` | Whether to get claims from userinfo endpoint (`true`/`false`).    |
| `Authentication__DefaultTokenReset`             | Default token reset value (sensitive).                            |
| `PORT`                                          | The port the application listens on (required for Docker/Render). |

### Development Setup

For local development, you can set these in your environment or use the `appsettings.Development.json` file (which contains the actual values for development).

### Docker Environment Variables

When running with Docker, pass these variables using `-e` flags:

```bash
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e ConnectionStrings__DefaultConnection="Your_Production_Connection_String" \
  -e Authentication__Authority="https://your-identity-provider.com" \
  -e Authentication__ClientId="your-client-id" \
  -e Authentication__ClientSecret="your-client-secret" \
  -e Authentication__ResponseType="code id_token" \
  -e Authentication__RequireHttpsMetadata="true" \
  -e Authentication__SaveTokens="true" \
  -e Authentication__GetClaimsFromUserInfoEndpoint="true" \
  -e Authentication__DefaultTokenReset="your-token-reset-value" \
  calendar-website
```

### Render Environment Variables

For Render deployment, you'll need to set environment variables in the Render dashboard. Here's how to configure it:

**Render Environment Variables Setup**

For Render deployment, set these environment variables in your Render service dashboard:

**1. Go to your Render Service → Settings → Environment Variables**

**2. Add these variables:**

| Key                                             | Value                                      | Description                   |
| ----------------------------------------------- | ------------------------------------------ | ----------------------------- |
| `ConnectionStrings__DefaultConnection`          | Your production database connection string | SQL Server connection         |
| `Authentication__Authority`                     | `https://identity.vntts.vn`                | OIDC authority URL            |
| `Authentication__ClientId`                      | `wf`                                       | Your client ID                |
| `Authentication__ClientSecret`                  | `Workflow3dDragonThunder`                  | Your production client secret |
| `Authentication__ResponseType`                  | `code id_token`                            | OIDC response type            |
| `Authentication__RequireHttpsMetadata`          | `true`                                     | HTTPS requirement             |
| `Authentication__SaveTokens`                    | `true`                                     | Save tokens setting           |
| `Authentication__GetClaimsFromUserInfoEndpoint` | `true`                                     | Get claims from userinfo      |
| `Authentication__DefaultTokenReset`             | `Dd0ONJmPgC8F9k5hksqA`                     | Token reset value             |
| `ASPNETCORE_ENVIRONMENT`                        | `Production`                               | Production environment        |

**3. Render-Specific Settings:**

- **Port**: Render automatically sets the `PORT` environment variable
- **Health Check**: Your `/health` endpoint is already configured
- **Build Command**: `docker build -t calendar-website .`
- **Start Command**: Render will use the Dockerfile's `ENTRYPOINT`
