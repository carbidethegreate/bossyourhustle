const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { db, init } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

init();

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'bossyourhustle-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static('public'));

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login.html?error=Please%20login');
  }
  next();
};

app.get('/', (req, res) => {
  const user = req.session.user;
  const message = req.query.message || '';
  res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Boss Your Hustle OF Tool Box</title>
<link rel="stylesheet" href="/style.css" />
</head>
<body>
<h1>Boss Your Hustle OF Tool Box</h1>
${user ? `<p>Welcome, ${user.username}!</p><a href="/logout">Logout</a>` : `<a href="/signup.html">Sign Up</a> | <a href="/login.html">Login</a>`}
<p class="message">${message}</p>
</body>
</html>`);
});

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
