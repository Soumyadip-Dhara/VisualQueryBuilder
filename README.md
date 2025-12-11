# VisualQueryBuilder

A powerful Visual Query Builder application that allows users to build and execute SQL queries through an intuitive drag-and-drop interface. Built with Angular frontend, .NET Core backend, and PostgreSQL database.

> **🎯 Want to run it right now?** → See **[RUN.md](RUN.md)** for the simplest instructions!

## 🚀 Quick Start

Get the application running in 5 minutes:

### Prerequisites
```bash
# Verify you have the required tools installed:
node --version    # Should be v18 or higher
dotnet --version  # Should be 8.0 or higher
docker --version  # For easy database setup (optional)
```

### Option 1: Using Docker (Recommended - Easiest)

1. **Start the database with sample data:**
   ```bash
   docker-compose up -d
   ```

2. **Start the backend API:**
   ```bash
   cd Backend/QueryBuilderAPI
   dotnet run
   ```
   Backend runs at http://localhost:5000

3. **Start the frontend (in a new terminal):**
   ```bash
   cd Frontend
   npm install
   npm start
   ```
   Frontend runs at http://localhost:4200

4. **Open your browser:**
   Navigate to http://localhost:4200 and start building queries!

### Option 2: Manual Setup

If you prefer not to use Docker, see the [detailed setup instructions](#setup-instructions) below.

> 💡 **First Time Users:** Check out the [Quick Start Guide](QUICK_START.md) for sample queries to try!

## Features

- 🎯 **Schema & Table Selection**: Select database schemas and tables from dropdown menus
- 📊 **Column Selection**: Choose columns from an organized accordion view showing all table columns
- 🔗 **Visual Join Builder**: Create INNER, LEFT, RIGHT, and FULL JOINs between tables
- 🔍 **Filter Conditions**: Add WHERE clauses with multiple operators (=, !=, >, <, >=, <=, LIKE, IN)
- 📝 **SQL Preview**: View generated SQL query before execution
- 📈 **Result Display**: View query results in a paginated data table
- 🎨 **Modern UI**: Built with PrimeNG components and PrimeIcons

## Technology Stack

### Frontend
- **Angular 17** - Modern web framework
- **PrimeNG 17** - Rich UI component library
- **PrimeIcons** - Icon library
- **TypeScript** - Type-safe JavaScript
- **SCSS** - Styling

### Backend
- **.NET Core 8.0** - Cross-platform backend framework
- **ASP.NET Core Web API** - RESTful API
- **Npgsql.EntityFrameworkCore.PostgreSQL** - PostgreSQL provider
- **C#** - Programming language

### Database
- **PostgreSQL** - Open-source relational database

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher) and npm
- **.NET SDK 8.0** or higher
- **Docker** (for easy database setup) OR **PostgreSQL** database server

> **Note:** Angular CLI is optional - you can use `npm start` instead of `ng serve` (Angular CLI is included as a project dependency).

### Verify Prerequisites

Run these commands to check if you have the required software:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check .NET SDK version
dotnet --version

# Check Docker (optional, for easy setup)
docker --version

# Check PostgreSQL (optional, if not using Docker)
psql --version
```

### Install Missing Prerequisites

**Node.js and npm:**
- Download from https://nodejs.org/ (LTS version recommended)

**.NET SDK 8.0:**
- Download from https://dotnet.microsoft.com/download

**Docker:**
- Download from https://www.docker.com/products/docker-desktop

**PostgreSQL** (only if not using Docker):
- Download from https://www.postgresql.org/download/

**Angular CLI** (optional, for global `ng` commands):
```bash
npm install -g @angular/cli
```
> Note: Not required for running the app - use `npm start` instead of `ng serve`

## Project Structure

```
VisualQueryBuilder/
├── Backend/
│   └── QueryBuilderAPI/
│       ├── Controllers/         # API Controllers
│       ├── Models/             # Data models
│       ├── Services/           # Business logic
│       └── appsettings.json    # Configuration
└── Frontend/
    └── src/
        ├── app/
        │   ├── components/     # UI Components
        │   ├── services/       # API Services
        │   └── models/         # TypeScript models
        └── environments/       # Environment configs
```

## Setup Instructions

### 1. Database Setup

1. Install PostgreSQL if not already installed
2. Create a new database:
   ```sql
   CREATE DATABASE querybuilder;
   ```
3. Create some sample tables and data for testing (optional):
   ```sql
   -- Example schema
   CREATE SCHEMA IF NOT EXISTS public;
   
   -- Example tables
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100),
       email VARCHAR(100)
   );
   
   CREATE TABLE orders (
       id SERIAL PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
       order_date DATE,
       total DECIMAL(10,2)
   );
   
   -- Sample data
   INSERT INTO users (name, email) VALUES 
       ('John Doe', 'john@example.com'),
       ('Jane Smith', 'jane@example.com');
   
   INSERT INTO orders (user_id, order_date, total) VALUES 
       (1, '2024-01-15', 150.00),
       (2, '2024-01-16', 200.00);
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend/QueryBuilderAPI
   ```

2. Update the connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=querybuilder;Username=postgres;Password=your_password"
     }
   }
   ```

3. Restore dependencies:
   ```bash
   dotnet restore
   ```

4. Build the project:
   ```bash
   dotnet build
   ```

5. Run the backend API:
   ```bash
   dotnet run
   ```

   The API will start at `http://localhost:5000` (or `https://localhost:5001` for HTTPS)

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API URL in `src/environments/environment.ts` if needed:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000'
   };
   ```

4. Start the development server:
   ```bash
   ng serve
   ```

5. Open your browser and navigate to `http://localhost:4200`

## Usage

### Step 1: Select Schema and Tables
1. Select a database schema from the dropdown
2. Choose one or more tables from the multi-select dropdown
3. Selected tables will show their columns in accordions

### Step 2: Select Columns
1. Expand table accordions to view available columns
2. Click on columns to add them to your query
3. Selected columns appear as chips below the accordion

### Step 3: Configure Joins (Optional)
1. Click "Add Join" to create table joins
2. Select join type (INNER, LEFT, RIGHT, FULL)
3. Choose left and right tables with their respective columns
4. Multiple joins can be added

### Step 4: Add Filters (Optional)
1. Click "Add Condition" to add WHERE clauses
2. Select column, operator, and value
3. Choose logical operator (AND/OR) for multiple conditions

### Step 5: Execute Query
1. Click "Execute Query" to run the query
2. View the generated SQL in the preview section
3. See results in the paginated data table
4. Use "Clear" to reset and start a new query

## API Endpoints

### Metadata Endpoints

- `GET /api/metadata/schemas` - Get all schemas
- `GET /api/metadata/tables?schemaName={schema}` - Get tables for a schema
- `GET /api/metadata/columns?schemaName={schema}&tableName={table}` - Get columns for a table
- `GET /api/metadata/foreign-keys?schemaName={schema}` - Get foreign key relationships

### Query Endpoint

- `POST /api/query/execute` - Execute a query
  ```json
  {
    "columns": [
      {
        "schemaName": "public",
        "tableName": "users",
        "columnName": "name"
      }
    ],
    "joins": [],
    "whereConditions": [],
    "orderBy": null,
    "limit": null
  }
  ```

## Configuration

### Backend Configuration

Edit `Backend/QueryBuilderAPI/appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=querybuilder;Username=postgres;Password=postgres"
  }
}
```

### Frontend Configuration

Edit `Frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000'
};
```

## Development

### Backend Development

```bash
cd Backend/QueryBuilderAPI
dotnet watch run  # Hot reload enabled
```

### Frontend Development

```bash
cd Frontend
ng serve  # Hot reload enabled
```

## Building for Production

### Backend

```bash
cd Backend/QueryBuilderAPI
dotnet publish -c Release -o ./publish
```

### Frontend

```bash
cd Frontend
ng build --configuration production
```

The production build will be in `Frontend/dist/frontend/`

## Troubleshooting

### Connection Issues

1. **Backend not connecting to database**:
   - Verify PostgreSQL is running: `docker ps` (for Docker) or `pg_isready` (for local)
   - Check connection string in `Backend/QueryBuilderAPI/appsettings.json`
   - Ensure database exists and user has proper permissions
   - Check database logs: `docker logs querybuilder-postgres`

2. **Frontend not connecting to backend**:
   - Verify backend is running on correct port (should see `Now listening on: http://localhost:5000`)
   - Check API URL in `Frontend/src/environments/environment.ts`
   - Ensure CORS is properly configured in backend
   - Check browser console for error messages

3. **Port already in use**:
   ```bash
   # Linux/Mac - Kill process on port 5000 (backend)
   lsof -ti:5000 | xargs kill -9
   
   # Linux/Mac - Kill process on port 4200 (frontend)
   lsof -ti:4200 | xargs kill -9
   
   # Windows - Find and kill process
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```
   
   Or use a different port:
   ```bash
   # Frontend on different port
   cd Frontend && ng serve --port 4201
   ```

### Build Issues

1. **Frontend build warnings about bundle size**:
   - These are expected with PrimeNG
   - Budget limits are configured in `angular.json`
   - Warnings don't prevent the app from running

2. **Backend package restore fails**:
   - Ensure .NET 8.0 SDK is installed: `dotnet --version`
   - Clear NuGet cache: `dotnet nuget locals all --clear`
   - Try restore again: `dotnet restore`

3. **Frontend npm install fails**:
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and package-lock.json:
     ```bash
     cd Frontend
     rm -rf node_modules package-lock.json
     npm install
     ```
   - Ensure Node.js version is v18 or higher: `node --version`

### Database Issues

1. **Database container won't start**:
   ```bash
   # Check Docker daemon is running
   docker ps
   
   # View container logs
   docker logs querybuilder-postgres
   
   # Remove and recreate container
   docker-compose down -v
   docker-compose up -d
   ```

2. **Sample data not loaded**:
   ```bash
   # From the project root directory
   docker exec -i querybuilder-postgres psql -U postgres -d querybuilder < database-setup.sql
   ```
   Note: Run this from the repository root where `database-setup.sql` is located.

3. **Connection refused errors**:
   - Wait for PostgreSQL to fully start (can take 10-30 seconds)
   - Check healthcheck: `docker inspect querybuilder-postgres`
   - Verify port 5432 is not used by another PostgreSQL instance

### Common Error Messages

- **"No such file or directory"**: Ensure you're in the correct directory
- **"dotnet: command not found"**: Install .NET SDK 8.0
- **"ng: command not found"**: Install Angular CLI with `npm install -g @angular/cli`
- **"npm: command not found"**: Install Node.js
- **"Cannot connect to database"**: Ensure PostgreSQL is running and connection string is correct

## Security Considerations

⚠️ **Important**: This application is designed for development and demonstration purposes.

For production use, please implement:
- SQL injection prevention (parameterized queries)
- Authentication and authorization
- Rate limiting
- Input validation and sanitization
- HTTPS enforcement
- Database user with minimal required permissions
- Proper error handling without exposing sensitive information

## Common Commands Reference

Quick reference for common tasks:

### Starting the Application
```bash
# Start database (Docker)
docker-compose up -d

# Start backend
cd Backend/QueryBuilderAPI && dotnet run

# Start frontend (in new terminal)
cd Frontend && npm start

# Access application
# Frontend: http://localhost:4200
# Backend API: http://localhost:5000
```

### Stopping the Application
```bash
# Stop frontend: Press Ctrl+C in terminal

# Stop backend: Press Ctrl+C in terminal

# Stop database
docker-compose down

# Stop database and remove data
docker-compose down -v
```

### Development Mode (with auto-reload)
```bash
# Backend with hot reload
cd Backend/QueryBuilderAPI && dotnet watch run

# Frontend with hot reload
cd Frontend && ng serve
```

### Database Operations
```bash
# View database logs (Docker)
docker logs querybuilder-postgres

# Connect to database (Docker)
docker exec -it querybuilder-postgres psql -U postgres -d querybuilder

# Reset database (Docker)
docker-compose down -v && docker-compose up -d
```

> **Note:** These Docker commands use the container name `querybuilder-postgres` which is set in `docker-compose.yml`. If you've modified the container name, adjust the commands accordingly.

### Building
```bash
# Build backend
cd Backend/QueryBuilderAPI && dotnet build

# Build frontend
cd Frontend && ng build

# Build for production
cd Backend/QueryBuilderAPI && dotnet publish -c Release
cd Frontend && ng build --configuration production
```

### Troubleshooting
```bash
# Check if ports are in use
# Backend port (5000)
lsof -ti:5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Frontend port (4200)
lsof -ti:4200  # Mac/Linux
netstat -ano | findstr :4200  # Windows

# View Docker containers
docker ps

# Check if PostgreSQL is ready
docker exec querybuilder-postgres pg_isready

# Reinstall frontend dependencies
cd Frontend && rm -rf node_modules package-lock.json && npm install
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.