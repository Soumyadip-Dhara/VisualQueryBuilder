# Testing Guide for Visual Query Builder Updates

This document provides instructions for testing the fixes and new features added to the Visual Query Builder.

## Changes Made

### 1. Fixed Multiple Joins Issue
**Problem**: When using multiple joins, the SQL generation was not properly tracking which tables had been included in the FROM clause, causing incorrect SQL generation.

**Solution**: 
- Updated the `GenerateSql` method to determine the base table intelligently
- If joins exist, use the left table of the first join as the FROM table
- Otherwise, use the table from the first selected column
- This ensures all subsequent joins reference tables that are already in the query

### 2. Added New SQL Features
The following SQL features have been added to both backend and frontend:

- **ORDER BY**: Sort results by one or more columns in ascending or descending order
- **GROUP BY**: Group rows that have the same values in specified columns
- **HAVING**: Filter grouped results (works like WHERE but for aggregated data)
- **OFFSET**: Skip a specified number of rows before returning results
- **LIMIT**: Already existed but now works seamlessly with OFFSET for pagination

## Testing Prerequisites

1. **Database Setup**: 
   ```bash
   psql -U postgres -d postgres -f database-setup.sql
   ```
   This creates sample tables: categories, products, customers, orders, and order_items

2. **Backend**: 
   ```bash
   cd Backend/QueryBuilderAPI
   dotnet run
   ```
   The API should start at http://localhost:5000

3. **Frontend**:
   ```bash
   cd Frontend
   npm install
   ng serve
   ```
   The app should start at http://localhost:4200

## Test Cases

### Test 1: Multiple Joins (Bug Fix)

**Objective**: Verify that multiple joins work correctly

**Steps**:
1. Open the Visual Query Builder at http://localhost:4200
2. Select schema: `public`
3. Select tables: `customers`, `orders`, `order_items`, `products`
4. Select columns:
   - customers.first_name
   - customers.last_name
   - orders.order_date
   - products.name
   - order_items.quantity
5. Add joins:
   - Join 1: customers.id = orders.customer_id (INNER JOIN)
   - Join 2: orders.id = order_items.order_id (INNER JOIN)
   - Join 3: order_items.product_id = products.id (INNER JOIN)
6. Click "Execute Query"

**Expected Result**:
- SQL should be generated correctly with proper FROM and multiple JOIN clauses
- The FROM clause should reference `customers` (the left table of the first join)
- All three joins should be properly formatted
- Results should show customer names with their order details and products
- Example SQL:
  ```sql
  SELECT "public"."customers"."first_name", "public"."customers"."last_name", 
         "public"."orders"."order_date", "public"."products"."name", 
         "public"."order_items"."quantity" 
  FROM "public"."customers" 
  INNER JOIN "public"."orders" ON "public"."customers"."id" = "public"."orders"."customer_id" 
  INNER JOIN "public"."order_items" ON "public"."orders"."id" = "public"."order_items"."order_id" 
  INNER JOIN "public"."products" ON "public"."order_items"."product_id" = "public"."products"."id"
  ```

### Test 2: ORDER BY Feature

**Objective**: Test sorting functionality

**Steps**:
1. Select schema: `public`
2. Select table: `products`
3. Select columns: products.name, products.price, products.stock_quantity
4. Click "Add Sorting"
5. Select column: price
6. Select direction: Descending (Z-A)
7. Click "Add Sorting" again
8. Select column: name
9. Select direction: Ascending (A-Z)
10. Click "Execute Query"

**Expected Result**:
- SQL should include: `ORDER BY "public"."products"."price" DESC, "public"."products"."name" ASC`
- Results should be sorted by price (highest first), then by name (A-Z) for products with the same price

### Test 3: GROUP BY Feature

**Objective**: Test grouping functionality

**Steps**:
1. Select schema: `public`
2. Select tables: `orders`, `customers`
3. Select columns: customers.first_name, customers.last_name
4. Add join: customers.id = orders.customer_id (INNER JOIN)
5. Click "Add Grouping"
6. Select column: customers.first_name
7. Click "Add Grouping" again
8. Select column: customers.last_name
9. Click "Execute Query"

**Expected Result**:
- SQL should include: `GROUP BY "public"."customers"."first_name", "public"."customers"."last_name"`
- Results should show unique customer names
- Each customer should appear only once

### Test 4: HAVING Clause

**Objective**: Test HAVING functionality (requires GROUP BY)

**Steps**:
1. Follow steps 1-8 from Test 3 (to set up GROUP BY)
2. Click "Add HAVING Condition"
3. Select column: (you can use COUNT or SUM aggregate in the value field)
4. Operator: `>=`
5. Value: `2` (note: this is a simplified test; in real scenarios, HAVING is used with aggregate functions)
6. Click "Execute Query"

**Expected Result**:
- SQL should include both GROUP BY and HAVING clauses
- The HAVING condition should be applied after grouping

### Test 5: LIMIT and OFFSET (Pagination)

**Objective**: Test pagination functionality

**Steps**:
1. Select schema: `public`
2. Select table: `products`
3. Select columns: products.name, products.price
4. In "Limit Results" section:
   - Set Limit: 5
   - Set Offset: 0
5. Click "Execute Query"
6. Note the results
7. Change Offset to 5
8. Click "Execute Query" again

**Expected Result**:
- First query should return 5 products (rows 1-5)
- SQL should include: `LIMIT 5 OFFSET 0`
- Second query should return the next 5 products (rows 6-10)
- SQL should include: `LIMIT 5 OFFSET 5`
- Different products should appear in each result set

### Test 6: Combined Features

**Objective**: Test all features working together

**Steps**:
1. Select schema: `public`
2. Select tables: `customers`, `orders`
3. Select columns: customers.first_name, customers.last_name, customers.city
4. Add join: customers.id = orders.customer_id (INNER JOIN)
5. Add WHERE condition: customers.country = 'USA'
6. Add GROUP BY: customers.first_name, customers.last_name, customers.city
7. Add ORDER BY: customers.last_name ASC
8. Set LIMIT: 10
9. Set OFFSET: 0
10. Click "Execute Query"

**Expected Result**:
- SQL should include all clauses in correct order: SELECT, FROM, JOIN, WHERE, GROUP BY, ORDER BY, LIMIT, OFFSET
- Results should be filtered, grouped, sorted, and paginated correctly
- Example SQL:
  ```sql
  SELECT "public"."customers"."first_name", "public"."customers"."last_name", "public"."customers"."city" 
  FROM "public"."customers" 
  INNER JOIN "public"."orders" ON "public"."customers"."id" = "public"."orders"."customer_id" 
  WHERE "public"."customers"."country" = 'USA' 
  GROUP BY "public"."customers"."first_name", "public"."customers"."last_name", "public"."customers"."city" 
  ORDER BY "public"."customers"."last_name" ASC 
  LIMIT 10 OFFSET 0
  ```

## Common Issues and Solutions

### Issue 1: Build Errors
If you encounter build errors:
- Backend: Run `dotnet clean` then `dotnet build`
- Frontend: Delete `node_modules` and `package-lock.json`, then run `npm install`

### Issue 2: Connection Refused
If the frontend can't connect to the backend:
- Verify the backend is running on port 5000
- Check CORS settings in the backend
- Verify the API URL in `Frontend/src/environments/environment.ts`

### Issue 3: Database Connection Error
If you see database connection errors:
- Verify PostgreSQL is running
- Check the connection string in `Backend/QueryBuilderAPI/appsettings.json`
- Ensure the database exists and sample data is loaded

## Notes on Implementation

### Backend Changes
1. **DatabaseModels.cs**: Added `OrderByClause`, `GroupByClause`, and updated `QueryRequest` to include new properties
2. **QueryExecutionService.cs**: 
   - Refactored `GenerateSql` method to handle multiple joins correctly
   - Added `DetermineFromTable` helper method
   - Added `BuildConditions` helper method to reuse logic for WHERE and HAVING
   - Added support for ORDER BY, GROUP BY, HAVING, LIMIT, and OFFSET clauses

### Frontend Changes
1. **database.models.ts**: Added `OrderByClause` and `GroupByClause` interfaces
2. **query-builder.component.ts**: 
   - Added new state variables for ORDER BY, GROUP BY, HAVING, LIMIT, OFFSET
   - Added methods to handle new dialogs and operations
   - Updated `executeQuery` to include new parameters
3. **query-builder.component.html**: 
   - Added UI sections for ORDER BY, GROUP BY, HAVING, LIMIT, OFFSET
   - Added dialogs for each new feature
   - Updated step numbering in the wizard
4. **query-builder.component.scss**: 
   - Added styles for new list items (order-list, group-list, having-list)

## Success Criteria

All tests should pass with:
- ✅ Correct SQL generation for multiple joins
- ✅ ORDER BY sorting working correctly
- ✅ GROUP BY grouping results properly
- ✅ HAVING filtering grouped results
- ✅ LIMIT and OFFSET pagination working
- ✅ All features working together in combination
- ✅ No TypeScript compilation errors
- ✅ No C# compilation errors
- ✅ Clean and intuitive UI

## Future Enhancements

Potential improvements for future versions:
- Aggregate functions (COUNT, SUM, AVG, MIN, MAX) in SELECT clause
- Support for subqueries
- UNION operations
- Window functions
- Expression builder for complex calculations
- Query performance analysis
- Query history and saved queries
