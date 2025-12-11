# Quick Start Guide

This guide will help you get the Visual Query Builder running quickly.

## Prerequisites Check

Run these commands to verify you have the required software:

```bash
# Check Node.js (should be v18+)
node --version

# Check npm
npm --version

# Check .NET SDK (should be 8.0+)
dotnet --version

# Check PostgreSQL (optional, can use Docker)
psql --version

# Check Docker (optional, for easy database setup)
docker --version
```

## Quick Setup (5 minutes)

### Option 1: Using Docker (Recommended)

1. **Start PostgreSQL with sample data:**
   ```bash
   docker-compose up -d
   ```
   This starts PostgreSQL and automatically loads sample data.

2. **Start the Backend API:**
   ```bash
   cd Backend/QueryBuilderAPI
   dotnet run
   ```
   Backend will run at http://localhost:5000

3. **Start the Frontend (in a new terminal):**
   ```bash
   cd Frontend
   npm install
   ng serve
   ```
   Frontend will run at http://localhost:4200

4. **Open your browser:**
   Navigate to http://localhost:4200

### Option 2: Using Local PostgreSQL

1. **Setup Database:**
   ```bash
   # Create database
   createdb querybuilder
   
   # Load sample data
   psql -d querybuilder -f database-setup.sql
   ```

2. **Update Backend Configuration:**
   Edit `Backend/QueryBuilderAPI/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=querybuilder;Username=YOUR_USER;Password=YOUR_PASSWORD"
     }
   }
   ```

3. **Start Backend:**
   ```bash
   cd Backend/QueryBuilderAPI
   dotnet run
   ```

4. **Start Frontend:**
   ```bash
   cd Frontend
   npm install
   ng serve
   ```

5. **Open Browser:**
   Go to http://localhost:4200

## First Query Example

Once the application is running, try this simple query:

1. **Select Schema:** Choose `public`
2. **Select Tables:** Choose `customers` and `orders`
3. **Select Columns:**
   - From customers: `first_name`, `last_name`, `email`
   - From orders: `order_date`, `total_amount`, `status`
4. **Add Join:**
   - Join Type: `INNER`
   - Left: `customers.id`
   - Right: `orders.customer_id`
5. **Click "Execute Query"**

You should see customer order data displayed in the results table!

## Sample Queries to Try

### 1. All Products by Category
- Tables: `products`, `categories`
- Columns: `categories.name`, `products.name`, `products.price`
- Join: `categories.id` = `products.category_id`

### 2. Order Details
- Tables: `orders`, `customers`, `order_items`, `products`
- Columns: `customers.first_name`, `orders.order_date`, `products.name`, `order_items.quantity`
- Joins:
  - `orders.customer_id` = `customers.id`
  - `order_items.order_id` = `orders.id`
  - `order_items.product_id` = `products.id`

### 3. High Value Orders
- Tables: `orders`, `customers`
- Columns: `customers.first_name`, `orders.total_amount`, `orders.order_date`
- Join: `orders.customer_id` = `customers.id`
- Filter: `orders.total_amount` > `100`

## Troubleshooting

### Port Already in Use

**Backend (5000):**
```bash
# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Frontend (4200):**
```bash
# Use a different port
ng serve --port 4201
```

### Database Connection Failed

1. Check if PostgreSQL is running:
   ```bash
   # Docker
   docker ps
   
   # Local
   pg_isready
   ```

2. Verify connection string in `appsettings.json`

3. Check PostgreSQL logs:
   ```bash
   # Docker
   docker logs querybuilder-postgres
   ```

### Frontend Build Errors

```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the sample database schema
- Try different join types and filters
- Check out the API documentation at http://localhost:5000/swagger

## Stopping the Application

```bash
# Stop frontend (Ctrl+C in terminal)

# Stop backend (Ctrl+C in terminal)

# Stop Docker PostgreSQL
docker-compose down

# Stop Docker and remove data
docker-compose down -v
```

## Getting Help

- Check the [README.md](README.md) for detailed documentation
- Review the sample queries above
- Check PostgreSQL logs if database issues occur
- Ensure all prerequisites are installed correctly
