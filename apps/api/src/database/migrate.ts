import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

  const migrationFiles = fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort();
  const seedFiles = fs.readdirSync(seedDir).filter((name) => name.endsWith('.sql')).sort();
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

  const user = config.db.user.replace(/[^a-zA-Z0-9_]/g, '');
  const password = config.db.password.replace(/'/g, "''");
  const database = config.db.database.replace(/[^a-zA-Z0-9_]/g, '');
  await connection.query(
    `CREATE USER IF NOT EXISTS '${user}'@'localhost' IDENTIFIED BY '${password}'`
  );
  await connection.query(`GRANT ALL PRIVILEGES ON \`${database}\`.* TO '${user}'@'localhost'`);
  await connection.query('FLUSH PRIVILEGES');
  await connection.end();
  process.stdout.write(`Database ${database} is ready for ${user}.\n`);
}

main().catch((err) => {
  process.stderr.write(`Database setup failed: ${err.message}\n`);
  process.exit(1);
});
