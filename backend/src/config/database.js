const mysql = require('mysql2/promise');
require('dotenv').config();

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
