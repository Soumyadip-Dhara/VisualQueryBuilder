# How to Run VisualQueryBuilder

## TL;DR - Fastest Way to Run

```bash
# 1. Start the database
docker-compose up -d

# 2. Start the backend (in terminal 1)
cd Backend/QueryBuilderAPI
dotnet run

# 3. Start the frontend (in terminal 2)
cd Frontend
npm install
npm start

# 4. Open browser
# Go to: http://localhost:4200
```

That's it! The application should now be running.

## What You Need Installed

- **Node.js** (v18+): Download from https://nodejs.org/
- **.NET SDK 8.0**: Download from https://dotnet.microsoft.com/download
- **Docker**: Download from https://www.docker.com/products/docker-desktop

### Check if you have them:
```bash
node --version    # Should show v18 or higher
dotnet --version  # Should show 8.0 or higher
docker --version  # Should show version info
```

## Troubleshooting

### "Command not found" errors?
- Install the missing tool from the links above

### Port already in use?
```bash
# Stop other services using ports 4200, 5000, or 5432
# Or use: docker-compose down
```

### Database connection issues?
```bash
# Reset the database
docker-compose down -v
docker-compose up -d
# Wait 10-20 seconds for database to start
```

### Still having issues?
See the full [README.md](README.md) for detailed setup instructions and troubleshooting.

## What Happens After Running?

1. **Database (PostgreSQL)** starts with sample data:
   - Customers, Products, Orders, Categories
   - Runs on port 5432

2. **Backend API** (.NET Core) starts:
   - REST API for query building
   - Runs on http://localhost:5000

3. **Frontend** (Angular) starts:
   - Visual query builder interface
   - Runs on http://localhost:4200

## First Query to Try

Once the app is running:

1. Select Schema: `public`
2. Select Tables: `customers` and `orders`
3. Add Join: `customers.id` = `orders.customer_id`
4. Select some columns from both tables
5. Click "Execute Query"

See [QUICK_START.md](QUICK_START.md) for more query examples!

## Stopping the Application

```bash
# Press Ctrl+C in both terminal windows (frontend and backend)

# Stop database
docker-compose down
```
