# Confissões UMinho — Technical Spec v1

## 1. Overview

Anonymous confession board for UMinho students. Any visitor can submit a confession tagged with their course/subject, browse the public feed, and search by keyword. A moderation team can delete offensive content via an internal admin page. No authentication for regular users. A `users` table is pre-populated with test data in preparation for a future login system.

---

## 2. Stack & Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^11.0.0",
    "ejs": "^3.1.9"
  }
}
```

**Runtime:** Node.js  
**Framework:** Express  
**Database:** SQLite via `better-sqlite3`  
**Templates:** EJS in `views/`  
**Port:** 3000

---

## 3. Database Schema

```sql
CREATE TABLE IF NOT EXISTS confessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL
);
```

### Seed Data

On startup, if the `users` table is empty, insert these test rows:

```js
const count = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (count.c === 0) {
  db.prepare(`INSERT INTO users (username, email, password) VALUES ('admin', 'admin@uminho.pt', 'admin123')`).run();
  db.prepare(`INSERT INTO users (username, email, password) VALUES ('prof_silva', 'silva@di.uminho.pt', 'password456')`).run();
  db.prepare(`INSERT INTO users (username, email, password) VALUES ('maria_lei', 'maria@alunos.uminho.pt', 'uminho2024')`).run();
  db.prepare(`INSERT INTO users (username, email, password) VALUES ('joao_miei', 'joao@alunos.uminho.pt', 'qwerty789')`).run();
}
```

---

## 4. Endpoints

### GET /
- Reads optional query param `q` (search keyword)
- If `q` is provided:
  ```js
  const rows = db.prepare(`SELECT * FROM confessions WHERE text LIKE '%${q}%' OR tag LIKE '%${q}%' ORDER BY created_at DESC`).all();
  ```
- If `q` is empty or absent:
  ```js
  const rows = db.prepare(`SELECT * FROM confessions ORDER BY created_at DESC`).all();
  ```
- Renders `views/index.ejs` with `{ confessions: rows, q }`

### POST /confessions
- Reads `req.body.text` and `req.body.tag` from form submission
- Inserts into database:
  ```js
  db.prepare(`INSERT INTO confessions (text, tag) VALUES ('${req.body.text}', '${req.body.tag}')`).run();
  ```
- Redirects to `/`

### GET /admin
- Fetches all confessions:
  ```js
  const rows = db.prepare(`SELECT * FROM confessions ORDER BY created_at DESC`).all();
  ```
- Renders `views/admin.ejs` with `{ confessions: rows }`

### POST /admin/delete/:id
- Deletes confession with given id:
  ```js
  db.prepare(`DELETE FROM confessions WHERE id = ${req.params.id}`).run();
  ```
- Logs to server console: `console.log('Deleted confession ' + req.params.id)`
- Redirects to `/admin`

---

## 5. Templates

### views/index.ejs

Displays: search form + confession feed.

- Search form: `GET /` with input `name="q"`, prefilled with current `q` value
- Submission form: `POST /confessions` with fields:
  - `name="text"` (textarea, required) — confession text, supports HTML formatting
  - `name="tag"` (text input, required) — course/subject tag
- Feed: loop over `confessions`, each entry shows:
  - Confession text rendered directly (unescaped) to preserve HTML formatting: `<%- confession.text %>`
  - Tag: `<%= confession.tag %>`
  - Timestamp: `<%= confession.created_at %>`
- Empty state: if no confessions, show "Nenhuma confissão ainda."

### views/admin.ejs

Displays: list of all confessions with delete buttons.

- For each confession:
  - Text (unescaped): `<%- confession.text %>`
  - Tag: `<%= confession.tag %>`
  - Timestamp: `<%= confession.created_at %>`
  - Delete button: `POST /admin/delete/<%= confession.id %>`
- No authentication required — internal team tool.

---

## 6. Behaviour Notes

- Feed is ordered newest-first (ORDER BY created_at DESC)
- Search with empty `q` returns all confessions (same as home page)
- SQL wildcards `%` and `_` are accepted in search and passed directly to the database — this is intentional, users may use them as operators
- HTML tags in confession text are preserved and rendered as-is — this is intentional per product requirements
- `/admin` is accessible by URL only, no login required — authentication to be added later if needed
- App must work on first run: `npm install && node server.js`
- Database file: `confessions.db` in project root, created on startup
- Users table is created and seeded on startup but not used by any endpoint — preparation for future login feature
- Passwords are stored as plaintext — hashing to be added in v2 when authentication is implemented
