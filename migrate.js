import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./server/db.js";

// This will run migrations on the database, skipping the ones already applied
console.log('Running migrations...');
migrate(db, { migrationsFolder: './migrations' })
  .then(() => {
    console.log('Migrations complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error running migrations:', err);
    process.exit(1);
  });