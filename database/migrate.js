/**
 * Database Migration Runner
 * Usage: node database/migrate.js
 */
require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

async function migrate() {
  console.log('🔗 Connecting to MySQL...');

  const sslConfig = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;
  const dbName = process.env.DB_NAME || 'legal_marketplace';

  const conn = await mysql.createConnection({
    host:               process.env.DB_HOST     || 'localhost',
    port:               Number(process.env.DB_PORT || 3306),
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    multipleStatements: true,
    ...(sslConfig ? { ssl: sslConfig } : {}),
  });

  console.log('✅ Connected!\n');

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8').replace(/__DBNAME__/g, dbName);
    console.log(`▶  Running: ${file}`);
    await conn.query(sql);
    console.log(`✅ Done: ${file}\n`);
  }

  await conn.end();
  console.log('🎉 All migrations complete!');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
