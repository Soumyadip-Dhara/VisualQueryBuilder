# VisualQueryBuilder

A powerful Visual Query Builder application that allows users to build and execute SQL queries through an intuitive drag-and-drop interface. Built with Angular frontend, .NET Core backend, and PostgreSQL database.

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
- **PostgreSQL** database server
- **Angular CLI** (`npm install -g @angular/cli`)

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
   - Verify PostgreSQL is running
   - Check connection string in `appsettings.json`
   - Ensure database exists and user has proper permissions

2. **Frontend not connecting to backend**:
   - Verify backend is running on correct port
   - Check API URL in environment files
   - Ensure CORS is properly configured

### Build Issues

1. **Frontend build warnings about bundle size**:
   - These are expected with PrimeNG
   - Budget limits are configured in `angular.json`

2. **Backend package restore fails**:
   - Ensure .NET 8.0 SDK is installed
   - Try: `dotnet nuget locals all --clear`

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.