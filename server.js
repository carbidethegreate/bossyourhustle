const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

// Our MySQL database wrapper
const { pool, init } = require('./db');

// Create the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Ensure database tables exist and seed the admin user if necessary
init().catch(err => {
  console.error('Database initialisation failed:', err);
  process.exit(1);
});

// Parse form submissions
app.use(express.urlencoded({ extended: true }));

// Configure sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'please_set_SESSION_SECRET',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

// Serve static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to require authentication on protected routes
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login.html');
  }
  next();
}

// Protected home page
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to expose session details to client-side scripts
app.get('/session', (req, res) => {
  res.json({ userId: req.session.userId || null, email: req.session.email || null });
});

// Handle user login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.redirect('/login.html?error=Missing+credentials');
  }
  try {
    const conn = await pool.getConnection();
    // Find the user by email or username
    const [rows] = await conn.query(
      'SELECT id, email, username, password_hash FROM users WHERE email = ? OR username = ? LIMIT 1',
      [username, username]
    );
    conn.release();
    if (!rows.length) {
      return res.redirect('/login.html?error=Invalid+credentials');
    }
    const user = rows[0];
    // Compare password hash
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.redirect('/login.html?error=Invalid+credentials');
    }
    // Login succeeded
    req.session.userId = user.id;
    req.session.email = user.email;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/login.html?error=Server+error');
  }
});

// Handle logout
app.get('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => res.redirect('/login.html?success=Logged+out'));
});

// Handle new account creation
app.post('/signup', async (req, res) => {
  const { username, email, password, is_creator } = req.body;
  if (!email || !password || !is_creator) {
    return res.redirect('/signup.html?error=All+fields+are+required+and+you+must+confirm+you+are+an+OnlyFans+creator');
  }
  try {
    // Hash password
    const hash = await bcrypt.hash(password, 12);
    const conn = await pool.getConnection();
    // Check for existing email
    const [exists] = await conn.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (exists.length) {
      conn.release();
      return res.redirect('/signup.html?error=Email+already+registered');
    }
    // Insert new user; mark email_verified = 1 as we are skipping email verification for now
    const [result] = await conn.query(
      'INSERT INTO users (username, email, password_hash, email_verified) VALUES (?, ?, ?, 1)',
      [username || null, email, hash]
    );
    conn.release();
    // Log the user in
    req.session.userId = result.insertId;
    req.session.email = email;
    // Redirect to key setup
    res.redirect('/setup-keys.html?success=Account+created');
  } catch (err) {
    console.error(err);
    res.redirect('/signup.html?error=Server+error');
  }
});

// Handle saving OnlyFans and OpenAI keys
app.post('/setup-keys', requireAuth, async (req, res) => {
  const { accountName, onlyfansEmail, onlyfansPassword, onlyfansApiKey, openaiApiKey } = req.body;
  if (!accountName) {
    return res.redirect('/setup-keys.html?error=Account+name+is+required');
  }
  // The user must either provide an OnlyFans login (email + password) or an API key
  const hasLogin = onlyfansEmail && onlyfansPassword;
  const hasApiKey = !!onlyfansApiKey;
  if (!hasLogin && !hasApiKey) {
    return res.redirect('/setup-keys.html?error=Provide+OnlyFans+email+and+password+or+an+API+key');
  }
  try {
    const updates = ['account_name = ?'];
    const params = [accountName];
    if (hasLogin) {
      const loginHash = await bcrypt.hash(onlyfansPassword, 12);
      updates.push('onlyfans_email = ?', 'onlyfans_password_hash = ?');
      params.push(onlyfansEmail, loginHash);
    }
    if (hasApiKey) {
      updates.push('onlyfans_api_key = ?');
      params.push(onlyfansApiKey);
    }
    if (openaiApiKey) {
      updates.push('openai_api_key = ?');
      params.push(openaiApiKey);
    }
    params.push(req.session.userId);
    const conn = await pool.getConnection();
    await conn.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    conn.release();
    res.redirect('/?success=Saved');
  } catch (err) {
    console.error(err);
    res.redirect('/setup-keys.html?error=Server+error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
