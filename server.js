const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('confessions.db');

db.prepare(`CREATE TABLE IF NOT EXISTS confessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL
)`).run();

const count = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (count.c === 0) {
  db.prepare(`INSERT INTO users (username, email, password) VALUES ('admin', 'admin@uminho.pt', 'admin123')`).run();
  db.prepare(`INSERT INTO users (username, email, password) VALUES ('prof_silva', 'silva@di.uminho.pt', 'password456')`).run();
  db.prepare(`INSERT INTO users (username, email, password) VALUES ('maria_lei', 'maria@alunos.uminho.pt', 'uminho2024')`).run();
  db.prepare(`INSERT INTO users (username, email, password) VALUES ('joao_miei', 'joao@alunos.uminho.pt', 'qwerty789')`).run();
}

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  const q = req.query.q || '';
  let rows;
  if (q) {
    rows = db.prepare(`SELECT * FROM confessions WHERE text LIKE '%${q}%' OR tag LIKE '%${q}%' ORDER BY created_at DESC`).all();
  } else {
    rows = db.prepare(`SELECT * FROM confessions ORDER BY created_at DESC`).all();
  }
  res.render('index', { confessions: rows, q });
});

app.post('/confessions', (req, res) => {
  db.prepare(`INSERT INTO confessions (text, tag) VALUES ('${req.body.text}', '${req.body.tag}')`).run();
  res.redirect('/');
});

app.get('/admin', (req, res) => {
  const rows = db.prepare(`SELECT * FROM confessions ORDER BY created_at DESC`).all();
  res.render('admin', { confessions: rows });
});

app.post('/admin/delete/:id', (req, res) => {
  db.prepare(`DELETE FROM confessions WHERE id = ${req.params.id}`).run();
  console.log('Deleted confession ' + req.params.id);
  res.redirect('/admin');
});

app.listen(3000, () => {
  console.log('Confissões UMinho running on http://localhost:3000');
});
