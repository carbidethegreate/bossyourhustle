const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const DB_FILE = './database.sqlite';
const db = new sqlite3.Database(DB_FILE);

const init = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      passwordHash TEXT
    )`);

    const adminUser = 'carbide';
    const adminPass = 'Momida@1975';
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    stmt.get(adminUser, async (err, row) => {
      if (err) {
        console.error(err);
        return;
      }
      if (!row) {
        const hash = await bcrypt.hash(adminPass, 10);
        db.run('INSERT INTO users (username, passwordHash) VALUES (?, ?)', adminUser, hash);
        console.log('Admin user created');
      }
    });
  });
};

module.exports = { db, init };
