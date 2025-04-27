# Educational Podcast Platform - Windows Setup Guide

This guide will help you set up and run the Educational Podcast Platform on Windows using Visual Studio Code.

## Prerequisites

1. Install [Node.js](https://nodejs.org/) (LTS version recommended)
2. Install [Visual Studio Code](https://code.visualstudio.com/)
3. Install [PostgreSQL](https://www.postgresql.org/download/windows/) for Windows

## Setup Steps

### 1. Database Setup

1. After installing PostgreSQL, open PostgreSQL Shell (psql) from the Start menu
2. Log in with your credentials (default username is typically `postgres`)
3. Create a new database:
   ```sql
   CREATE DATABASE educationalpodcast;
   ```

### 2. Project Setup

1. Extract the project files to a folder on your machine
2. Rename these Windows-specific files (removing the "-windows" suffix):
   - `package-windows.json` → `package.json`
   - `server/db-windows.ts` → `server/db.ts`
   - `server/index-windows.ts` → `server/index.ts`
   - `drizzle.config.windows.ts` → `drizzle.config.ts`

3. Edit the `.env` file and update the database connection details:
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/educationalpodcast
   ```
   Replace `yourpassword` with your actual PostgreSQL password.

4. Open the project folder in Visual Studio Code:
   ```
   code .
   ```

### 3. Install Dependencies

Open a terminal in VS Code (Terminal > New Terminal) and run:

```bash
npm install
```

### 4. Create Upload Directories

Run the Windows-specific setup script:

```bash
npm run setup:windows
```

This creates the necessary folders for file uploads.

### 5. Initialize the Database

Push the database schema to PostgreSQL:

```bash
npm run db:push
```

### 6. Start the Application

Start the development server:

```bash
npm run dev
```

The application should now be running at [http://localhost:5000](http://localhost:5000)

### 7. Create Initial User

If you need to create an initial user, you can:

1. Register a new user using the `/auth` page
2. Or, create a script to register a user with proper role:

```javascript
// register-test-user.js
const fetch = require('node-fetch');

async function registerTestUser() {
  try {
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'professor1',
        password: 'password123',
        email: 'professor@example.com',
        fullName: 'Professor Name',
        role: 'professor'
      })
    });
    
    const data = await response.json();
    console.log('User registered:', data);
  } catch (error) {
    console.error('Error registering user:', error);
  }
}

registerTestUser();
```

Run it with `node register-test-user.js`

## Troubleshooting

### Database Connection Issues

If you experience database connection problems:

1. Check your PostgreSQL service is running (Services app in Windows)
2. Verify your password in the `.env` file
3. Try using individual connection parameters in `server/db.ts` instead of the connection string

### Port Already in Use

If port 5000 is already in use:

1. Change the `PORT=5000` in `.env` to another port (e.g., 3000)
2. Restart the server

### File Upload Issues

If file uploads don't work:

1. Verify the uploads directories exist
2. Check permissions on the uploads folder
3. Ensure the full path is accessible to the application

## Deployment Options

### 1. Local Windows Deployment

For production on your Windows machine:

1. Build the application:
   ```
   npm run build
   ```

2. Start in production mode:
   ```
   npm start
   ```

### 2. Using PM2 (Process Manager)

For a more robust solution:

1. Install PM2 globally:
   ```
   npm install -g pm2
   ```

2. Start your app:
   ```
   pm2 start npm -- start
   ```

3. Set up PM2 to start with Windows:
   ```
   npm install -g pm2-windows-startup
   pm2-startup install
   pm2 save
   ```

### 3. IIS Deployment

To host on Windows IIS:

1. Install IIS on your Windows server
2. Install [IIS URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite)
3. Install [iisnode](https://github.com/Azure/iisnode)
4. Create a web.config file in your project root
5. Configure IIS to point to your application folder

## Project Structure

- `/client` - React frontend code
- `/server` - Express backend code
- `/shared` - Shared code (schemas, types)
- `/uploads` - Media files uploaded by users
- `/migrations` - Database migration files

## Need Help?

If you encounter any issues during setup or deployment, please refer to:
- Node.js documentation: https://nodejs.org/en/docs/
- PostgreSQL documentation: https://www.postgresql.org/docs/
- Drizzle ORM documentation: https://orm.drizzle.team/