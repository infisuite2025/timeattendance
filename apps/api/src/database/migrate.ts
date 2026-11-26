import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { config } from '../config/env.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationDir = path.resolve(here, '../../../../infrastructure/database/migrations');
const seedDir = path.resolve(here, '../../../../infrastructure/database/seeds');

async function main() {
  const adminUser = process.env.DB_ADMIN_USER || 'root';
  const adminPassword = process.env.DB_ADMIN_PASSWORD ?? '';
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: adminUser,
    password: adminPassword,
    multipleStatements: true,
  });

  const byName = (a: string, b: string) => a.localeCompare(b);
  const migrationFiles = fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort(byName);
  const seedFiles = fs.readdirSync(seedDir).filter((name) => name.endsWith('.sql')).sort(byName);
  const schema = migrationFiles.filter((name) => name.startsWith('001'));
  const afterSeed = migrationFiles.filter((name) => !name.startsWith('001'));
  const files = [
    ...schema.map((name) => path.join(migrationDir, name)),
    ...seedFiles.map((name) => path.join(seedDir, name)),
    ...afterSeed.map((name) => path.join(migrationDir, name)),
  ];

  for (const file of files) {
    const sql = fs.readFileSync(file, 'utf8');
    process.stdout.write(`Applying ${path.basename(file)}...\n`);
    await connection.query(sql);
  }

  const user = config.db.user.replaceAll(/\W/g, '');
  const password = config.db.password.replaceAll("'", "''");
  const database = config.db.database.replaceAll(/\W/g, '');
  await connection.query(
    `CREATE USER IF NOT EXISTS '${user}'@'localhost' IDENTIFIED BY '${password}'`
  );
  await connection.query(`GRANT ALL PRIVILEGES ON \`${database}\`.* TO '${user}'@'localhost'`);
  await connection.query('FLUSH PRIVILEGES');
  await connection.end();
  process.stdout.write(`Database ${database} is ready for ${user}.\n`);
}

try {
  await main();
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown database setup error';
  process.stderr.write(`Database setup failed: ${message}\n`);
  process.exit(1);
}
