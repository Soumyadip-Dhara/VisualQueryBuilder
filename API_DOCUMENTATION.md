# API Documentation

## Base URL

Development: `http://localhost:5000/api`

## Authentication

Currently, the API does not require authentication. For production use, implement JWT authentication.

## Endpoints

### Metadata Endpoints

#### Get All Schemas

Retrieve all database schemas (excluding system schemas).

**Request:**
```http
GET /api/metadata/schemas
```

**Response:**
```json
[
  {
    "schemaName": "public"
  },
  {
    "schemaName": "custom_schema"
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Database connection or query error

---

#### Get Tables

Retrieve all tables in a schema or all schemas.

**Request:**
```http
GET /api/metadata/tables?schemaName={schema}
```

**Query Parameters:**
- `schemaName` (optional) - Filter tables by schema name

**Response:**
```json
[
  {
    "schemaName": "public",
    "tableName": "customers"
  },
  {
    "schemaName": "public",
    "tableName": "orders"
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Database error

---

#### Get Columns

Retrieve all columns for a specific table.

**Request:**
```http
GET /api/metadata/columns?schemaName={schema}&tableName={table}
```

**Query Parameters:**
- `schemaName` (required) - Schema name
- `tableName` (required) - Table name

**Response:**
```json
[
  {
    "schemaName": "public",
    "tableName": "customers",
    "columnName": "id",
    "dataType": "integer",
    "isNullable": false,
    "isPrimaryKey": true,
    "isForeignKey": false
  },
  {
    "schemaName": "public",
    "tableName": "customers",
    "columnName": "name",
    "dataType": "character varying",
    "isNullable": false,
    "isPrimaryKey": false,
    "isForeignKey": false
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Missing required parameters
- `500 Internal Server Error` - Database error

---

#### Get Foreign Keys

Retrieve foreign key relationships for a schema or all schemas.

**Request:**
```http
GET /api/metadata/foreign-keys?schemaName={schema}
```

**Query Parameters:**
- `schemaName` (optional) - Filter by schema name

**Response:**
```json
[
  {
    "constraintName": "orders_customer_id_fkey",
    "sourceSchema": "public",
    "sourceTable": "orders",
    "sourceColumn": "customer_id",
    "targetSchema": "public",
    "targetTable": "customers",
    "targetColumn": "id"
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Database error

---

### Query Endpoints

#### Execute Query

Build and execute a SQL query from structured input.

**Request:**
```http
POST /api/query/execute
Content-Type: application/json
```

**Request Body:**
```json
{
  "columns": [
    {
      "schemaName": "public",
      "tableName": "customers",
      "columnName": "name",
      "alias": "customer_name"
    },
    {
      "schemaName": "public",
      "tableName": "orders",
      "columnName": "total",
      "alias": null
    }
  ],
  "joins": [
    {
      "joinType": "INNER",
      "leftSchema": "public",
      "leftTable": "customers",
      "leftColumn": "id",
      "rightSchema": "public",
      "rightTable": "orders",
      "rightColumn": "customer_id"
    }
  ],
  "whereConditions": [
    {
      "schemaName": "public",
      "tableName": "orders",
      "columnName": "total",
      "operator": ">",
      "value": "100",
      "logicalOperator": null
    }
  ],
  "orderBy": "orders.total",
  "orderDirection": "DESC",
  "limit": 50
}
```

**Request Body Schema:**

```typescript
interface QueryRequest {
  columns: SelectedColumn[];           // Required, at least 1
  joins: JoinInfo[];                   // Optional
  whereConditions: WhereCondition[];   // Optional
  orderBy?: string;                    // Optional
  orderDirection?: string;             // Optional: "ASC" or "DESC"
  limit?: number;                      // Optional
}

interface SelectedColumn {
  schemaName: string;
  tableName: string;
  columnName: string;
  alias?: string;                      // Optional column alias
}

interface JoinInfo {
  joinType: string;                    // "INNER" | "LEFT" | "RIGHT" | "FULL"
  leftSchema: string;
  leftTable: string;
  leftColumn: string;
  rightSchema: string;
  rightTable: string;
  rightColumn: string;
}

interface WhereCondition {
  schemaName: string;
  tableName: string;
  columnName: string;
  operator: string;                    // "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN"
  value: string;
  logicalOperator?: string;            // "AND" | "OR" (for multiple conditions)
}
```

**Response:**
```json
{
  "generatedSql": "SELECT \"public\".\"customers\".\"name\" AS \"customer_name\", \"public\".\"orders\".\"total\" FROM \"public\".\"customers\" INNER JOIN \"public\".\"orders\" ON \"public\".\"customers\".\"id\" = \"public\".\"orders\".\"customer_id\" WHERE \"public\".\"orders\".\"total\" > 100 ORDER BY orders.total DESC LIMIT 50",
  "data": [
    {
      "customer_name": "John Doe",
      "total": 150.00
    },
    {
      "customer_name": "Jane Smith",
      "total": 125.50
    }
  ],
  "totalRows": 2
}
```

**Status Codes:**
- `200 OK` - Query executed successfully
- `400 Bad Request` - Invalid request (missing columns, invalid operators)
- `500 Internal Server Error` - Database error or SQL execution error

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "Human-readable error message",
  "error": "Detailed error information (in development only)"
}
```

**Examples:**

```json
{
  "message": "At least one column must be selected"
}
```

```json
{
  "message": "Error executing query",
  "error": "relation \"public.nonexistent\" does not exist"
}
```

---

## Rate Limiting

Currently, there is no rate limiting. For production:
- Implement rate limiting per IP/user
- Suggested: 100 requests per minute per user
- Return `429 Too Many Requests` when limit exceeded

---

## CORS

The API allows requests from:
- `http://localhost:4200` (Angular dev server)

For production, configure CORS in `Program.cs` to allow your frontend domain.

---

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:5000/swagger
```

This provides:
- Interactive API testing
- Request/response schemas
- Example values
- Try-it-out functionality

---

## Query Building Examples

### Simple Query

Select all columns from one table:

```json
{
  "columns": [
    {
      "schemaName": "public",
      "tableName": "customers",
      "columnName": "id"
    },
    {
      "schemaName": "public",
      "tableName": "customers",
      "columnName": "name"
    }
  ],
  "joins": [],
  "whereConditions": []
}
```

Generated SQL:
```sql
SELECT "public"."customers"."id", "public"."customers"."name" 
FROM "public"."customers"
```

---

### Query with Join

Join two tables:

```json
{
  "columns": [
    {
      "schemaName": "public",
      "tableName": "customers",
      "columnName": "name"
    },
    {
      "schemaName": "public",
      "tableName": "orders",
      "columnName": "order_date"
    }
  ],
  "joins": [
    {
      "joinType": "INNER",
      "leftSchema": "public",
      "leftTable": "customers",
      "leftColumn": "id",
      "rightSchema": "public",
      "rightTable": "orders",
      "rightColumn": "customer_id"
    }
  ],
  "whereConditions": []
}
```

Generated SQL:
```sql
SELECT "public"."customers"."name", "public"."orders"."order_date" 
FROM "public"."customers" 
INNER JOIN "public"."orders" 
  ON "public"."customers"."id" = "public"."orders"."customer_id"
```

---

### Query with Filters

Add WHERE conditions:

```json
{
  "columns": [
    {
      "schemaName": "public",
      "tableName": "products",
      "columnName": "name"
    },
    {
      "schemaName": "public",
      "tableName": "products",
      "columnName": "price"
    }
  ],
  "joins": [],
  "whereConditions": [
    {
      "schemaName": "public",
      "tableName": "products",
      "columnName": "price",
      "operator": ">",
      "value": "50"
    },
    {
      "schemaName": "public",
      "tableName": "products",
      "columnName": "name",
      "operator": "LIKE",
      "value": "%Laptop%",
      "logicalOperator": "AND"
    }
  ]
}
```

Generated SQL:
```sql
SELECT "public"."products"."name", "public"."products"."price" 
FROM "public"."products" 
WHERE "public"."products"."price" > 50 
  AND "public"."products"."name" LIKE '%Laptop%'
```

---

### Complex Query

Multiple joins and filters:

```json
{
  "columns": [
    {
      "schemaName": "public",
      "tableName": "customers",
      "columnName": "name",
      "alias": "customer"
    },
    {
      "schemaName": "public",
      "tableName": "products",
      "columnName": "name",
      "alias": "product"
    },
    {
      "schemaName": "public",
      "tableName": "order_items",
      "columnName": "quantity"
    }
  ],
  "joins": [
    {
      "joinType": "INNER",
      "leftSchema": "public",
      "leftTable": "customers",
      "leftColumn": "id",
      "rightSchema": "public",
      "rightTable": "orders",
      "rightColumn": "customer_id"
    },
    {
      "joinType": "INNER",
      "leftSchema": "public",
      "leftTable": "orders",
      "leftColumn": "id",
      "rightSchema": "public",
      "rightTable": "order_items",
      "rightColumn": "order_id"
    },
    {
      "joinType": "INNER",
      "leftSchema": "public",
      "leftTable": "order_items",
      "leftColumn": "product_id",
      "rightSchema": "public",
      "rightTable": "products",
      "rightColumn": "id"
    }
  ],
  "whereConditions": [
    {
      "schemaName": "public",
      "tableName": "order_items",
      "columnName": "quantity",
      "operator": ">",
      "value": "1"
    }
  ],
  "orderBy": "order_items.quantity",
  "orderDirection": "DESC",
  "limit": 10
}
```

---

## Best Practices

1. **Always validate input** on the frontend before sending to API
2. **Use aliases** for columns with same names from different tables
3. **Limit result sets** to prevent large data transfers
4. **Test queries** with small limits first
5. **Handle errors gracefully** in the UI
6. **Cache metadata** to reduce API calls

---

## Future Enhancements

Planned API improvements:
- [ ] Query validation endpoint
- [ ] Query explain/analyze endpoint
- [ ] Saved queries management
- [ ] Query history
- [ ] Export results (CSV, Excel)
- [ ] Pagination for large result sets
- [ ] Aggregate functions support
- [ ] GROUP BY and HAVING support
