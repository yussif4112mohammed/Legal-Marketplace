const mysql = require('mysql2/promise');
require('dotenv').config();

// Aiven (and most managed MySQL providers) require SSL.
// Set DB_SSL=true in your environment to enable it.
// If you've downloaded Aiven's CA certificate, point DB_CA_CERT_PATH at it
// for full certificate verification. Otherwise we fall back to an
// encrypted-but-unverified connection (fine for a small project, not ideal
// for handling sensitive production data long-term).
const fs = require('fs');
let sslConfig;
if (process.env.DB_SSL === 'true') {
  if (process.env.DB_CA_CERT_PATH && fs.existsSync(process.env.DB_CA_CERT_PATH)) {
    sslConfig = { ca: fs.readFileSync(process.env.DB_CA_CERT_PATH), rejectUnauthorized: true };
  } else {
    sslConfig = { rejectUnauthorized: false };
  }
}

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  port:             Number(process.env.DB_PORT || 3306),
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'legal_marketplace',
  waitForConnections: true,
  connectionLimit:  20,
  queueLimit:       0,
  charset:          'utf8mb4',
  timezone:         '+00:00',
  ...(sslConfig ? { ssl: sslConfig } : {}),
});

/**
 * Run a SELECT query — returns array of rows
 */
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Run a SELECT query — returns first row or null
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

/**
 * Run an INSERT / UPDATE / DELETE — returns ResultSetHeader
 */
async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

/**
 * Test the connection
 */
async function testConnection() {
  const conn = await pool.getConnection();
  console.log('✅ MySQL connected');
  conn.release();
}

module.exports = { pool, query, queryOne, execute, testConnection };
