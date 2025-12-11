# Visual Query Builder - Architecture Documentation

## System Architecture

The Visual Query Builder follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Angular)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Query Builder Component                 │  │
│  │  - Schema Selection  - Column Selection           │  │
│  │  - Table Selection   - Join Configuration        │  │
│  │  - Filter Builder    - Results Display            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Services Layer                       │  │
│  │  - MetadataService  - QueryService                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
┌─────────────────────────────────────────────────────────┐
│               Backend (.NET Core Web API)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Controllers                          │  │
│  │  - MetadataController  - QueryController          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Services Layer                       │  │
│  │  - DatabaseMetadataService                        │  │
│  │  - QueryExecutionService                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                      Npgsql Driver
                           │
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Information Schema Views                │  │
│  │  - schemata  - tables  - columns                  │  │
│  │  - table_constraints  - key_column_usage          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              User Data Tables                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Components

#### Query Builder Component
- **Purpose**: Main UI for building and executing queries
- **Key Features**:
  - Multi-step wizard interface
  - Drag-and-drop column selection (click to add)
  - Visual join builder with dialogs
  - Filter condition builder
  - Live SQL preview
  - Paginated results display
- **Technologies**: Angular 17, PrimeNG, RxJS

#### Services

**MetadataService**
- Fetches database metadata from backend
- Caches schema information
- Methods:
  - `getSchemas()`: Retrieve all schemas
  - `getTables(schema)`: Get tables in a schema
  - `getColumns(schema, table)`: Get columns for a table
  - `getForeignKeys(schema)`: Get foreign key relationships

**QueryService**
- Executes queries through backend API
- Handles query request/response
- Methods:
  - `executeQuery(request)`: Execute a query and return results

### Backend Components

#### Controllers

**MetadataController**
- Endpoints:
  - `GET /api/metadata/schemas`
  - `GET /api/metadata/tables?schemaName={schema}`
  - `GET /api/metadata/columns?schemaName={schema}&tableName={table}`
  - `GET /api/metadata/foreign-keys?schemaName={schema}`

**QueryController**
- Endpoints:
  - `POST /api/query/execute`

#### Services

**DatabaseMetadataService**
- Queries PostgreSQL information schema
- Returns structured metadata about database objects
- Uses Npgsql for direct database access

**QueryExecutionService**
- Builds SQL queries from structured requests
- Executes queries safely
- Returns results as JSON

## Data Flow

### Query Execution Flow

1. **User Input** → User builds query in UI
2. **Request Formation** → Angular service creates QueryRequest object
3. **HTTP POST** → Request sent to `/api/query/execute`
4. **SQL Generation** → Backend builds SQL from request
5. **Query Execution** → SQL executed against PostgreSQL
6. **Result Mapping** → Results converted to JSON
7. **HTTP Response** → Results sent back to frontend
8. **Display** → Results shown in PrimeNG DataTable

### Metadata Loading Flow

1. **Component Init** → QueryBuilderComponent.ngOnInit()
2. **Load Schemas** → GET /api/metadata/schemas
3. **User Selects Schema** → Store selected schema
4. **Load Tables** → GET /api/metadata/tables?schemaName={schema}
5. **User Selects Table** → Load columns for table
6. **Load Columns** → GET /api/metadata/columns?schemaName={schema}&tableName={table}
7. **Display in UI** → Show columns in accordion

## Security Considerations

### Current Implementation
- CORS configured for localhost development
- Basic input validation on backend
- SQL injection prevention through parameterized identifiers

### Production Recommendations
1. **Authentication & Authorization**
   - Add JWT authentication
   - Implement role-based access control
   - Limit schemas/tables based on user permissions

2. **Input Validation**
   - Validate all user inputs
   - Whitelist allowed operators
   - Limit query complexity (max joins, max results)

3. **SQL Injection Prevention**
   - Already using quoted identifiers
   - Add parameterized values for WHERE clauses
   - Implement query timeout limits

4. **Rate Limiting**
   - Add API rate limiting
   - Implement query result caching
   - Set maximum result set size

5. **Logging & Monitoring**
   - Log all query executions
   - Monitor for suspicious patterns
   - Alert on errors

## Database Schema

### Information Schema Views Used

```sql
-- Schemas
information_schema.schemata
  - schema_name

-- Tables
information_schema.tables
  - table_schema
  - table_name
  - table_type

-- Columns
information_schema.columns
  - table_schema
  - table_name
  - column_name
  - data_type
  - is_nullable
  - ordinal_position

-- Constraints
information_schema.table_constraints
  - constraint_name
  - table_schema
  - table_name
  - constraint_type

-- Foreign Keys
information_schema.key_column_usage
information_schema.constraint_column_usage
```

## Performance Considerations

### Frontend Optimization
- Lazy loading for large column lists
- Virtual scrolling for result tables
- Debounce on search/filter inputs
- Caching of metadata responses

### Backend Optimization
- Connection pooling (built into Npgsql)
- Query result pagination
- Metadata caching
- Async/await for all database operations

### Database Optimization
- Indexes on frequently joined columns
- Regular VACUUM and ANALYZE
- Query plan analysis for slow queries
- Connection limits and timeouts

## Extension Points

### Easy Extensions
1. **Export Results**
   - Add CSV/Excel export
   - Add JSON export
   - Add SQL script export

2. **Query Management**
   - Save queries for reuse
   - Query history
   - Query templates

3. **Visual Enhancements**
   - Database diagram view
   - Query builder canvas with drag-drop
   - Real-time query validation

4. **Advanced Features**
   - Aggregate functions (COUNT, SUM, AVG)
   - GROUP BY and HAVING
   - Subqueries
   - UNION/INTERSECT/EXCEPT

### Architecture Extensions
1. **Multi-Database Support**
   - Add MySQL provider
   - Add SQL Server provider
   - Abstract database operations

2. **Microservices**
   - Separate metadata service
   - Separate query execution service
   - Add API gateway

3. **Caching Layer**
   - Add Redis for metadata caching
   - Cache query results
   - Implement cache invalidation

## Technology Choices

### Why Angular?
- Strong TypeScript support
- Component-based architecture
- Good for complex single-page applications
- Excellent tooling and CLI

### Why PrimeNG?
- Rich component library
- Professional UI components
- Good documentation
- Active community

### Why .NET Core?
- Cross-platform
- High performance
- Excellent async support
- Strong typing with C#

### Why PostgreSQL?
- Open source
- ACID compliant
- Rich information schema
- Excellent performance
- JSON support for flexible data

## Development Workflow

### Local Development
1. Start PostgreSQL (Docker or local)
2. Start backend: `dotnet run`
3. Start frontend: `ng serve`
4. Make changes with hot reload

### Testing
- Backend: Unit tests with xUnit
- Frontend: Jasmine/Karma tests
- Integration: End-to-end with Cypress

### Deployment
- Backend: Docker container or Azure App Service
- Frontend: Static hosting (Azure Static Web Apps, Netlify)
- Database: Managed PostgreSQL (Azure, AWS RDS)

## Monitoring & Logging

### Backend Logging
- Structured logging with Serilog
- Log levels: Debug, Info, Warning, Error
- Log to console and file

### Frontend Logging
- Console logging in development
- Error tracking with Sentry (production)
- Analytics with Google Analytics

### Application Insights
- Request/response times
- Error rates
- User behavior analytics
- Query performance metrics
