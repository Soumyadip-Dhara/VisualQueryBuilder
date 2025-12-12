# Example Queries for Testing

This file contains example queries that can be used to test the Visual Query Builder features using the sample database created by `database-setup.sql`.

## Test 1: Simple Single Table Query with ORDER BY

**Description**: Get all products sorted by price descending

**Configuration**:
- Schema: `public`
- Table: `products`
- Columns: `name`, `price`, `stock_quantity`
- ORDER BY: `price DESC`

**Expected SQL**:
```sql
SELECT "public"."products"."name", "public"."products"."price", "public"."products"."stock_quantity" 
FROM "public"."products" 
ORDER BY "public"."products"."price" DESC
```

**Expected Results**: All products listed with highest priced items first (Laptop Computer $899.99 should be at the top)

---

## Test 2: Multiple Joins (Bug Fix Test)

**Description**: Get customer orders with product details (3-table join)

**Configuration**:
- Schema: `public`
- Tables: `customers`, `orders`, `order_items`, `products`
- Columns: 
  - `customers.first_name`
  - `customers.last_name`
  - `orders.order_date`
  - `products.name`
  - `order_items.quantity`
  - `order_items.subtotal`
- Joins:
  1. `customers.id = orders.customer_id` (INNER JOIN)
  2. `orders.id = order_items.order_id` (INNER JOIN)
  3. `order_items.product_id = products.id` (INNER JOIN)

**Expected SQL**:
```sql
SELECT "public"."customers"."first_name", "public"."customers"."last_name", 
       "public"."orders"."order_date", "public"."products"."name", 
       "public"."order_items"."quantity", "public"."order_items"."subtotal" 
FROM "public"."customers" 
INNER JOIN "public"."orders" ON "public"."customers"."id" = "public"."orders"."customer_id" 
INNER JOIN "public"."order_items" ON "public"."orders"."id" = "public"."order_items"."order_id" 
INNER JOIN "public"."products" ON "public"."order_items"."product_id" = "public"."products"."id"
```

**Expected Results**: Each row shows a customer name, order date, product name, quantity, and subtotal

**Key Point**: The FROM clause should reference `customers` (the left table of the first join), not just the first selected column's table. This was the bug that was fixed.

---

## Test 3: GROUP BY with Multiple Tables

**Description**: Count orders per customer

**Configuration**:
- Schema: `public`
- Tables: `customers`, `orders`
- Columns: 
  - `customers.first_name`
  - `customers.last_name`
  - `customers.email`
- Joins:
  1. `customers.id = orders.customer_id` (INNER JOIN)
- GROUP BY:
  - `customers.first_name`
  - `customers.last_name`
  - `customers.email`

**Expected SQL**:
```sql
SELECT "public"."customers"."first_name", "public"."customers"."last_name", "public"."customers"."email" 
FROM "public"."customers" 
INNER JOIN "public"."orders" ON "public"."customers"."id" = "public"."orders"."customer_id" 
GROUP BY "public"."customers"."first_name", "public"."customers"."last_name", "public"."customers"."email"
```

**Expected Results**: Each customer who has orders appears once (John Doe should appear once even though he has 2 orders)

---

## Test 4: ORDER BY with Multiple Columns

**Description**: Products sorted by category and price

**Configuration**:
- Schema: `public`
- Tables: `products`, `categories`
- Columns:
  - `categories.name`
  - `products.name`
  - `products.price`
- Joins:
  1. `products.category_id = categories.id` (INNER JOIN)
- ORDER BY:
  1. `categories.name ASC`
  2. `products.price DESC`

**Expected SQL**:
```sql
SELECT "public"."categories"."name", "public"."products"."name", "public"."products"."price" 
FROM "public"."products" 
INNER JOIN "public"."categories" ON "public"."products"."category_id" = "public"."categories"."id" 
ORDER BY "public"."categories"."name" ASC, "public"."products"."price" DESC
```

**Expected Results**: Products grouped by category, with most expensive products first within each category

---

## Test 5: Pagination with LIMIT and OFFSET

**Description**: Get products page-by-page

**Configuration (Page 1)**:
- Schema: `public`
- Table: `products`
- Columns: `name`, `price`
- ORDER BY: `name ASC`
- LIMIT: `5`
- OFFSET: `0`

**Expected SQL**:
```sql
SELECT "public"."products"."name", "public"."products"."price" 
FROM "public"."products" 
ORDER BY "public"."products"."name" ASC 
LIMIT 5 OFFSET 0
```

**Expected Results**: First 5 products alphabetically

**Configuration (Page 2)**: Change OFFSET to `5`

**Expected SQL**:
```sql
SELECT "public"."products"."name", "public"."products"."price" 
FROM "public"."products" 
ORDER BY "public"."products"."name" ASC 
LIMIT 5 OFFSET 5
```

**Expected Results**: Next 5 products alphabetically (different from page 1)

---

## Test 6: WHERE and ORDER BY Combined

**Description**: Electronics products sorted by price

**Configuration**:
- Schema: `public`
- Tables: `products`, `categories`
- Columns:
  - `products.name`
  - `products.price`
  - `categories.name`
- Joins:
  1. `products.category_id = categories.id` (INNER JOIN)
- WHERE:
  - `categories.name = 'Electronics'`
- ORDER BY:
  - `products.price DESC`

**Expected SQL**:
```sql
SELECT "public"."products"."name", "public"."products"."price", "public"."categories"."name" 
FROM "public"."products" 
INNER JOIN "public"."categories" ON "public"."products"."category_id" = "public"."categories"."id" 
WHERE "public"."categories"."name" = 'Electronics' 
ORDER BY "public"."products"."price" DESC
```

**Expected Results**: Only electronics products, sorted by price (Laptop Computer $899.99 should be first)

---

## Test 7: All Features Combined

**Description**: Complex query using JOIN, WHERE, GROUP BY, ORDER BY, LIMIT

**Configuration**:
- Schema: `public`
- Tables: `customers`, `orders`
- Columns:
  - `customers.first_name`
  - `customers.last_name`
  - `customers.city`
- Joins:
  1. `customers.id = orders.customer_id` (INNER JOIN)
- WHERE:
  - `customers.country = 'USA'`
- GROUP BY:
  - `customers.first_name`
  - `customers.last_name`
  - `customers.city`
- ORDER BY:
  - `customers.last_name ASC`
- LIMIT: `10`
- OFFSET: `0`

**Expected SQL**:
```sql
SELECT "public"."customers"."first_name", "public"."customers"."last_name", "public"."customers"."city" 
FROM "public"."customers" 
INNER JOIN "public"."orders" ON "public"."customers"."id" = "public"."orders"."customer_id" 
WHERE "public"."customers"."country" = 'USA' 
GROUP BY "public"."customers"."first_name", "public"."customers"."last_name", "public"."customers"."city" 
ORDER BY "public"."customers"."last_name" ASC 
LIMIT 10 OFFSET 0
```

**Expected Results**: US customers who have placed orders, sorted by last name, limited to 10 results

**Key Point**: Notice the proper SQL clause ordering: SELECT → FROM → JOIN → WHERE → GROUP BY → ORDER BY → LIMIT → OFFSET

---

## Verification Checklist

For each test:
- [ ] SQL is generated without errors
- [ ] SQL syntax is correct with all identifiers properly quoted
- [ ] SQL clauses appear in the correct order
- [ ] Query executes without database errors
- [ ] Results match expectations
- [ ] UI displays results properly in the data table
- [ ] Clear button resets all fields correctly

## Notes

1. **Multiple Joins**: Test 2 is the most important for verifying the bug fix. The FROM clause must reference `customers`, not just any table.

2. **OFFSET with 0**: OFFSET 0 is now valid and will be included in the SQL (previously it was skipped).

3. **GROUP BY**: When using GROUP BY, all non-aggregated columns in SELECT must be in GROUP BY clause.

4. **HAVING**: Currently implemented but requires GROUP BY. For proper testing of HAVING with aggregate functions, you would need to select aggregate columns (which is a future enhancement).

5. **Clause Ordering**: SQL requires clauses in a specific order. The implementation correctly follows: SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET.
