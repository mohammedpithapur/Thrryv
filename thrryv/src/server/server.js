const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 images

// Database Setup (Creates thrryv.db file automatically)
const db = new sqlite3.Database('./thrryv.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to the SQLite database.');
});

// Initialize Tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, 
    username TEXT, 
    handle TEXT, 
    avatar TEXT, 
    bio TEXT, 
    reputationScore INTEGER, 
    moments INTEGER, 
    supporters INTEGER, 
    interests INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY, 
    userId TEXT, 
    username TEXT, 
    userScore INTEGER, 
    avatar TEXT, 
    image TEXT, 
    caption TEXT, 
    reputationGain INTEGER, 
    likes INTEGER, 
    type TEXT, 
    timestamp INTEGER
  )`);

  // Seed Default User if empty
  db.get("SELECT count(*) as count FROM users", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
      stmt.run('u1', 'Julie Murray', '@juliem', 'https://i.pravatar.cc/150?img=9', "I don't wait for opportunities, I make them!", 750, 12, 8405, 450);
      stmt.finalize();
      console.log("Seeded default user.");
    }
  });
});

// --- API ROUTES ---

// Get User
app.get('/users/:id', (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.params.id], (err, row) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(row);
  });
});

// Get All Posts
app.get('/posts', (req, res) => {
  db.all("SELECT * FROM posts ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Create Post
app.post('/posts', (req, res) => {
  const { id, userId, username, userScore, avatar, image, caption, reputationGain, likes, type, timestamp } = req.body;
  
  const stmt = db.prepare("INSERT INTO posts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  stmt.run(id, userId, username, userScore, avatar, image, caption, reputationGain, likes, type, timestamp, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Update User Score
    db.run("UPDATE users SET reputationScore = reputationScore + ?, moments = moments + 1 WHERE id = ?", [reputationGain, userId]);
    
    res.json({ success: true, id: this.lastID });
  });
  stmt.finalize();
});

// Like Post
app.post('/posts/:id/like', (req, res) => {
  db.run("UPDATE posts SET likes = likes + 1 WHERE id = ?", [req.params.id], function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ success: true, likes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});