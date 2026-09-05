require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./database/database');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();
const port = Number(process.env.PORT) || 3000;
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '8mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-only-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

const publicUser = (user) => ({ id: user.id, name: user.name, username: user.username, email: user.email, created_at: user.created_at });
const validDifficulty = ['easy', 'medium', 'hard', 'expert'];

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'VisionPuzzle AI' }));

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;
    if (!name || !username || !email || !password || password !== confirmPassword) return res.status(400).json({ error: 'Complete every field and make sure passwords match.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const result = db.prepare('INSERT INTO users (name, username, email, password_hash) VALUES (?, ?, ?, ?)').run(name.trim(), username.trim(), email.trim().toLowerCase(), passwordHash);
    req.session.userId = result.lastInsertRowid;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) return res.status(409).json({ error: 'That username or email is already in use.' });
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE').get(identifier?.trim(), identifier?.trim());
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) return res.status(401).json({ error: 'Invalid username/email or password.' });
    req.session.userId = user.id;
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

app.post('/api/auth/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));
app.get('/api/auth/me', (req, res) => {
  const user = req.session.userId && db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  res.json({ user: user ? publicUser(user) : null });
});

app.get('/api/user/profile', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, username, email, created_at FROM users WHERE id = ?').get(req.session.userId);
  const stats = db.prepare('SELECT COUNT(*) games, COALESCE(MAX(score), 0) bestScore, COALESCE(AVG(accuracy), 0) accuracy FROM games WHERE user_id = ?').get(req.session.userId);
  const achievements = db.prepare('SELECT a.name, a.description, ua.unlocked_at FROM user_achievements ua JOIN achievements a ON a.id = ua.achievement_id WHERE ua.user_id = ?').all(req.session.userId);
  res.json({ user, stats, achievements });
});
app.put('/api/user/profile', requireAuth, (req, res, next) => {
  try {
    const { name, username } = req.body;
    if (!name?.trim() || !username?.trim()) return res.status(400).json({ error: 'Name and username are required.' });
    db.prepare('UPDATE users SET name = ?, username = ? WHERE id = ?').run(name.trim(), username.trim(), req.session.userId);
    res.json({ user: db.prepare('SELECT id, name, username, email, created_at FROM users WHERE id = ?').get(req.session.userId) });
  } catch (error) { if (String(error.message).includes('UNIQUE')) return res.status(409).json({ error: 'That username is already in use.' }); next(error); }
});

app.post('/api/games', requireAuth, (req, res, next) => {
  try {
    const { difficulty, puzzleSize, gameMode = 'classic', score = 0, completionTime = 0, moves = 0, mistakes = 0, accuracy = 0 } = req.body;
    if (!validDifficulty.includes(difficulty) || ![3, 4, 5].includes(Number(puzzleSize))) return res.status(400).json({ error: 'Invalid game configuration.' });
    const result = db.prepare('INSERT INTO games (user_id, difficulty, puzzle_size, game_mode, score, completion_time, moves, mistakes, accuracy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(req.session.userId, difficulty, puzzleSize, gameMode, Math.max(0, Math.round(score)), Math.max(0, Math.round(completionTime)), Math.max(0, Math.round(moves)), Math.max(0, Math.round(mistakes)), Math.max(0, Math.min(100, Number(accuracy))));
    updateAchievements(req.session.userId, result.lastInsertRowid);
    res.status(201).json({ game: db.prepare('SELECT * FROM games WHERE id = ?').get(result.lastInsertRowid) });
  } catch (error) { next(error); }
});
app.get('/api/games/history', requireAuth, (req, res) => {
  const query = req.query.difficulty && validDifficulty.includes(req.query.difficulty) ? ' AND difficulty = ?' : '';
  const params = query ? [req.session.userId, req.query.difficulty] : [req.session.userId];
  res.json({ games: db.prepare(`SELECT * FROM games WHERE user_id = ?${query} ORDER BY created_at DESC`).all(...params) });
});
app.get('/api/games/stats', requireAuth, (req, res) => {
  const stats = db.prepare('SELECT COUNT(*) gamesPlayed, COALESCE(AVG(score), 0) averageScore, COALESCE(MAX(score), 0) bestScore, COALESCE(AVG(completion_time), 0) averageTime, COALESCE(AVG(accuracy), 0) accuracy FROM games WHERE user_id = ?').get(req.session.userId);
  const recent = db.prepare('SELECT * FROM games WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').all(req.session.userId);
  res.json({ stats, recent });
});
app.get('/api/games/recommendation', requireAuth, (req, res) => {
  const stats = db.prepare('SELECT COUNT(*) gamesPlayed, COALESCE(AVG(completion_time), 0) averageTime, COALESCE(AVG(accuracy), 0) accuracy FROM games WHERE user_id = ?').get(req.session.userId);
  let recommendedDifficulty = 'medium';
  if (stats.gamesPlayed >= 3 && stats.accuracy >= 90 && stats.averageTime < 120) recommendedDifficulty = 'hard';
  else if (stats.gamesPlayed >= 3 && (stats.accuracy < 65 || stats.averageTime > 300)) recommendedDifficulty = 'easy';
  res.json({ recommendedDifficulty, stats });
});
app.get('/api/leaderboard', (_req, res) => res.json({ leaderboard: db.prepare('SELECT u.username, MAX(g.score) score, COUNT(g.id) games, MIN(g.completion_time) bestTime FROM users u JOIN games g ON g.user_id = u.id GROUP BY u.id ORDER BY score DESC LIMIT 50').all() }));
app.get('/api/achievements', requireAuth, (req, res) => res.json({ achievements: db.prepare('SELECT a.*, ua.unlocked_at FROM achievements a LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?').all(req.session.userId) }));

function updateAchievements(userId, gameId) {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
  const games = db.prepare('SELECT COUNT(*) count FROM games WHERE user_id = ?').get(userId).count;
  const conditions = [
    ['First Puzzle', games >= 1], ['Speed Solver', game.completion_time < 120], ['Perfect Solve', game.accuracy >= 100],
    ['Gesture Master', game.moves >= 10], ['10 Games Completed', games >= 10], ['Puzzle Champion', game.score >= 1000]
  ];
  const insert = db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)');
  for (const [name, unlocked] of conditions) if (unlocked) { const achievement = db.prepare('SELECT id FROM achievements WHERE name = ?').get(name); insert.run(userId, achievement.id); }
}

app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')));
app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: 'Something went wrong on the server.' }); });
db.initialize().then(() => {
  const server = app.listen(port, () => console.log(`VisionPuzzle AI running at http://localhost:${port}`));
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the existing VisionPuzzle server or start with a different PORT.`);
    } else {
      console.error('Server failed to start:', error);
    }
    process.exitCode = 1;
  });
}).catch((error) => {
  console.error('Database initialization failed:', error);
  process.exitCode = 1;
});
