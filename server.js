/*
 * HTTP server for BossYourHustle using Express.
 *
 * This version uses MariaDB for persistence via the db.js module.  It provides
 * a simple login form that authenticates against the `users` table, stores
 * session information in memory and protects the index page from anonymous
 * access.  Static assets are served from the `public` directory.
 */

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const { pool, init } = require('./db');

require('dotenv').config();

// Initialise database and seed admin user if necessary
init();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

// Middleware to protect routes that require authentication
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login.html');
  }
  next();
}

// Serve files from the public directory relative to this file
app.use(express.static(path.join(__dirname, 'public')));

// Home page is protected
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to expose the current session username (used by front end)
app.get('/session', (req, res) => {
  res.json({ username: req.session.username || null });
});

// Handle login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.redirect('/login.html?error=Invalid+credentials');
  }
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT id, username, password_hash FROM users WHERE username = ?', [username]);
    conn.release();
    if (rows.length === 0) {
      return res.redirect('/login.html?error=Invalid+credentials');
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.redirect('/login.html?error=Invalid+credentials');
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    res.redirect('/');
  } catch (err) {
    console.error('Error during login:', err);
    res.redirect('/login.html?error=Server+error');
  }
});

// Log out route clears the session
app.get('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html?success=Logged+out');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
