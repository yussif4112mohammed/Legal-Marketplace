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

  const conn = await mysql.createConnection({
    host:               process.env.DB_HOST     || 'localhost',
    port:               Number(process.env.DB_PORT || 3306),
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('✅ Connected!\n');

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
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
