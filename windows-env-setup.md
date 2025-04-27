# Setting Up the Environment Variables on Windows

## Step 1: Create the .env file

Create a file named `.env` in the root of your project directory with the following content:

```
# Database connection
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/educationalpodcast
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=yourpassword
PGDATABASE=educationalpodcast
PGPORT=5432

# Session secret (for authentication)
SESSION_SECRET=your-super-secret-key-change-this-in-production

# Server configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# Storage paths for uploaded files
UPLOAD_DIR=./uploads
MEDIA_DIR=./uploads/media
THUMBNAIL_DIR=./uploads/thumbnails
```

## Step 2: Replace placeholder values

Replace the following values with your actual PostgreSQL configuration:
- `yourpassword` with your actual PostgreSQL password
- `educationalpodcast` with your database name if you used a different name
- `your-super-secret-key-change-this-in-production` with a strong random string for session security

## Step 3: Create the database

If you haven't created the PostgreSQL database yet:

1. Open the PostgreSQL command prompt (psql) or a tool like pgAdmin
2. Create a new database:
   ```sql
   CREATE DATABASE educationalpodcast;
   ```

## Step 4: Create upload directories

Make sure the upload directories exist by running these commands in PowerShell:

```powershell
mkdir -p uploads
mkdir -p uploads/media
mkdir -p uploads/thumbnails
```

## Step 5: Run the database migrations

Push the database schema:

```powershell
npm run db:push
```

## Step 6: Start the application

Now you should be able to run:

```powershell
npm run dev
```

## Troubleshooting Windows-Specific Issues

### Issue: Database connection fails

Try using explicit parameters in `server/db.ts` instead of the connection string:

```typescript
// Instead of:
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Try:
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT || '5432'),
});
```

### Issue: "Cannot find module 'dotenv'"

Install dotenv package:

```
npm install dotenv
```

### Issue: Problems with file paths

Make sure you're using the path module to handle file paths correctly:

```javascript
const path = require('path');
const uploadPath = path.join(__dirname, '..', 'uploads');
```

### Issue: Process doesn't terminate properly on Ctrl+C

Create a `db-close.js` file to properly close database connections:

```javascript
// db-close.js
process.on('SIGINT', () => {
  console.log('Closing database connections...');
  require('./server/db').pool.end();
  process.exit(0);
});
```

And include it in your start command:
```
"dev": "set NODE_ENV=development && node -r ./db-close.js -r tsx/cjs server/index.ts"
```