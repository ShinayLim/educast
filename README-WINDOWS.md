# Educational Podcast Platform - Windows Setup 

This project has been modified to work on Windows without requiring a PostgreSQL database. It now uses in-memory storage for development and testing purposes.

## Quick Start for Windows

1. **Clone/extract the project files** to your preferred location

2. **Prepare the environment**:
   - Rename `server/index-windows.ts` to `server/index.ts`
   
3. **Install dependencies**:
   ```
   npm install
   ```

4. **Start the application**:
   ```
   npm run dev
   ```
   or using Windows command syntax:
   ```
   set NODE_ENV=development && tsx server/index.ts
   ```

5. **Access the application**:
   - Open a browser and navigate to `http://localhost:5000`

## Key Changes for Windows Compatibility

The following modifications have been made to ensure the app works on Windows without database requirements:

1. **In-Memory Storage**:
   - Using `MemStorage` implementation instead of `DatabaseStorage`
   - All data is stored in memory during the application runtime
   - Data is lost when the application is restarted

2. **Windows-Compatible Server**:
   - Modified server startup code in `index-windows.ts`
   - Removed `reusePort` option which is not supported on Windows
   - Added automatic creation of upload directories

3. **Fixed UI Components**:
   - Fixed nested `<a>` tags in components to prevent React warnings
   - Updated all link components to use proper nesting

## Pre-Loaded Test Data

The in-memory storage comes with some pre-loaded test data for demonstration:

- **Users**: 
  - Sample professors and students accounts
  - Default password for all accounts: "password123"

- **Content**: 
  - Sample podcasts and lectures
  - Playlists
  - Comments and ratings

## Troubleshooting

### Port Already in Use

If you get an error that port 5000 is already in use:
1. Kill the process using port 5000, or
2. Modify the port number in `server/index.ts` (or index-windows.ts before renaming)

### File Upload Issues

If you encounter issues with file uploads:
1. Make sure the uploads directory exists in your project root
2. Check that the application has permission to write to this directory

### Memory Storage Limitations

Since this version uses in-memory storage:
1. All data is lost when you restart the application
2. Large numbers of uploads/users might affect performance
3. This configuration is suitable for development/testing only