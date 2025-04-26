import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './shared/schema.js';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }

  console.log('Creating a postgres client...');
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  
  console.log('Creating a drizzle instance...');
  const db = drizzle(migrationClient, { schema });
  
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './migrations' });
  
  console.log('Migrations complete!');
  
  await migrationClient.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error in migration script:', err);
  process.exit(1);
});