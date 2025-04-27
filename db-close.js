/**
 * This file handles graceful shutdown of database connections
 * Include this in your start command using -r flag
 * e.g., node -r ./db-close.js -r tsx/cjs server/index.ts
 */

process.on('SIGINT', async () => {
  try {
    console.log('\nGracefully shutting down...');
    console.log('Closing database connections...');
    
    // Try to import and close pool from db.ts
    try {
      const { pool } = require('./server/db');
      if (pool && typeof pool.end === 'function') {
        await pool.end();
        console.log('Database connections closed successfully');
      }
    } catch (err) {
      console.error('Error closing database connections:', err.message);
    }
    
    console.log('Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});