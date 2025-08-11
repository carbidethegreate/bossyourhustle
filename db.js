const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'byhdb_',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function init() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      passwordHash VARCHAR(255)
    )`);
    const [rows] = await conn.query('SELECT * FROM users WHERE username = ?', [process.env.ADMIN_USER || 'admin']);
    if (rows.length === 0) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASS || 'changeme', 12);
      await conn.query('INSERT INTO users (username, passwordHash) VALUES (?, ?)', [process.env.ADMIN_USER || 'admin', hash]);
      console.log('Admin user seeded');
    }
  } catch (err) {
    console.error(err);
  } finally {
    conn.release();
  }
}

module.exports = { pool, init };
