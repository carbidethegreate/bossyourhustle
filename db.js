const mysql = require('mysql2/promise');

// Create a connection pool using environment variables or default values
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'byhdb_',
  waitForConnections: true,
  connectionLimit: 10
});

// Initialise the database by creating tables if they do not exist
async function init() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      email VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      email_verified TINYINT(1) DEFAULT 1,
      onlyfans_api_key VARCHAR(255),
      openai_api_key VARCHAR(255),
      account_name VARCHAR(255),
      onlyfans_email VARCHAR(255),
      onlyfans_password_hash VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  const conn = await pool.getConnection();
  await conn.query(createSql);
  conn.release();
}

module.exports = { pool, init };
