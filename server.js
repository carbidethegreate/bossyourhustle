const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const { db, init } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

init();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'bossyourhustle-secret',
  resave: false,
  saveUninitialized: false
}));

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login.html?error=Please%20login');
  }
  next();
};

app.get(['/', '/index.html'], requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/session', (req, res) => {
  res.json({ user: req.session.user || null });
});

app.use(express.static('public'));

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.redirect('/signup.html?error=Missing%20fields');
  }
  db.get('SELECT * FROM users WHERE username = ?', username, async (err, row) => {
    if (err) return res.redirect('/signup.html?error=Server%20error');
    if (row) return res.redirect('/signup.html?error=User%20exists');
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, passwordHash) VALUES (?, ?)', username, hash, (err2) => {
      if (err2) return res.redirect('/signup.html?error=Server%20error');
      res.redirect('/login.html?success=Account%20created');
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', username, async (err, user) => {
    if (err || !user) return res.redirect('/login.html?error=Invalid%20credentials');
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.redirect('/login.html?error=Invalid%20credentials');
    req.session.user = { id: user.id, username: user.username };
    res.redirect('/?message=Logged%20in');
  });
});

app.get('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/?message=Logged%20out');
  });
});

app.post('/send-message', requireAuth, async (req, res) => {
  const { message, recipientId } = req.body;
  if (!message || !recipientId) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }
  const apiKey = process.env.ONLYFANS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'API key not configured' });
  }
  try {
    const response = await fetch('https://api.onlyfansapi.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ message, recipientId })
    });
    if (!response.ok) {
      const errText = await response.text();
      return res
        .status(response.status)
        .json({ success: false, error: errText });
    }
    const data = await response.json();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
