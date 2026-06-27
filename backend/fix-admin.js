const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
  const sslConfig = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'legal_marketplace',
    ...(sslConfig ? { ssl: sslConfig } : {}),
  });
  const hash = await bcrypt.hash('Password123!', 12);
  await db.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hash, 'admin@legalmarket.com']);
  console.log('Admin password reset to: Password123!');
  await db.end();
}

fix().catch(err => console.error('Error:', err.message));
