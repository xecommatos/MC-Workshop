# Confissões UMinho — Technical Spec v2 (Security-Hardened)

> This spec keeps all original functionality from v1 and adds explicit security requirements. Sections are identical in structure so v1 and v2 can be compared side-by-side.

---

## 1. Overview

Anonymous confession board for UMinho students. Any visitor can submit a confession tagged with their course/subject, browse the public feed, and search by keyword. A moderation team can delete offensive content via an admin page protected by password authentication. No authentication for regular users.

---

## 2. Stack & Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^11.0.0",
    "ejs": "^3.1.9",
    "express-session": "^1.17.3"
  }
}
```

**Runtime:** Node.js  
**Framework:** Express  
**Database:** SQLite via `better-sqlite3`  
**Templates:** EJS in `views/`  
**Port:** 3000

### Security Requirements

- **No additional packages needed** for XSS, SQLi, and missing auth fixes — all addressed via code patterns in existing stack.
- `express-session` is required for admin authentication.
- Do NOT add `helmet`, CSRF, or other packages beyond what is listed above.

---

## 3. Database Schema

```sql
CREATE TABLE IF NOT EXISTS confessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

*(No changes from v1.)*

---

## 4. Endpoints

### GET /
- Reads optional query param `q` (search keyword)
- If `q` is provided, query using **parameterized query**:
  ```js
  const rows = db.prepare('SELECT * FROM confessions WHERE text LIKE ? OR tag LIKE ? ORDER BY created_at DESC').all(`%${q}%`, `%${q}%`);
  ```
- If `q` is empty or absent:
  ```js
  const rows = db.prepare('SELECT * FROM confessions ORDER BY created_at DESC').all();
  ```
- Renders `views/index.ejs` with `{ confessions: rows, q }`

#### Security Requirements
- **SQL Injection prevention:** All SQL queries MUST use parameterized queries (`db.prepare(sql).all(params)`). Never interpolate user input into SQL strings. The `LIKE` pattern (`%${q}%`) is safe to build in JS as long as it's passed as a parameter, not concatenated into the SQL string itself.
- **Why:** User-supplied `q` interpolated directly into SQL (as in v1) allows attackers to append arbitrary SQL — e.g., `' OR '1'='1` returns all rows, and `%' UNION SELECT ...` can exfiltrate schema and data.

### POST /confessions
- Reads `req.body.text` and `req.body.tag` from form submission
- Inserts using **parameterized query**:
  ```js
  db.prepare('INSERT INTO confessions (text, tag) VALUES (?, ?)').run(req.body.text, req.body.tag);
  ```
- Redirects to `/`

#### Security Requirements
- **SQL Injection prevention:** Use parameterized query as shown above. Never interpolate `req.body.text` or `req.body.tag` into the SQL string.
- **Why:** v1 used `INSERT INTO confessions (text, tag) VALUES ('${req.body.text}', '${req.body.tag}')` — a confession text containing a single quote breaks the query and allows arbitrary SQL execution.

### GET /admin
- **Requires authentication** — see middleware below.
- Fetches all confessions using parameterized query:
  ```js
  const rows = db.prepare('SELECT * FROM confessions ORDER BY created_at DESC').all();
  ```
- Renders `views/admin.ejs` with `{ confessions: rows }`

#### Security Requirements
- **Missing Access Control fix:** The `/admin` route MUST be protected by authentication middleware. Implement a simple session-based check:
  ```js
  function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) return next();
    res.redirect('/admin/login');
  }
  app.get('/admin', requireAuth, (req, res) => { ... });
  ```
- **Why:** In v1, `/admin` is accessible by any visitor who knows the URL. Any student can delete all confessions without credentials.

### POST /admin/delete/:id
- **Requires authentication** — apply `requireAuth` middleware.
- Deletes confession using parameterized query:
  ```js
  db.prepare('DELETE FROM confessions WHERE id = ?').run(req.params.id);
  ```
- Logs: `console.log('Deleted confession ' + req.params.id)`
- Redirects to `/admin`

#### Security Requirements
- **Missing Access Control:** Apply `requireAuth` middleware to this route as well.
- **SQL Injection prevention:** Use parameterized query for the DELETE. `req.params.id` looks safe (URL segment) but parameterization is always required for user-supplied values.
- **Why:** Even if `id` is typically numeric, an unparameterized delete could be exploited; more importantly, without auth, any visitor can delete any confession by ID.

### GET /admin/login
- Renders `views/admin-login.ejs`

### POST /admin/login
- Reads `req.body.password`
- Checks against hardcoded admin password (e.g., `process.env.ADMIN_PASSWORD || 'workshop-demo'`)
- If correct: sets `req.session.authenticated = true`, redirects to `/admin`
- If wrong: renders `views/admin-login.ejs` with `{ error: 'Palavra-passe incorrecta.' }`

---

## 5. Templates

### views/index.ejs

Displays: search form + confession feed.

- Search form: `GET /` with input `name="q"`, prefilled with `<%= q %>`
- Submission form: `POST /confessions` with fields:
  - `name="text"` (textarea, required)
  - `name="tag"` (text input, required)
- Feed: loop over `confessions`, each entry shows:
  - Confession text **HTML-escaped**: `<%= confession.text %>` *(changed from `<%-` in v1)*
  - Tag: `<%= confession.tag %>`
  - Timestamp: `<%= confession.created_at %>`
- Empty state: "Nenhuma confissão ainda."

#### Security Requirements
- **XSS prevention:** Confession text MUST be rendered with `<%= %>` (HTML-escaped), not `<%- %>` (unescaped). EJS's `<%= %>` automatically converts `<`, `>`, `"`, `'`, `&` to their HTML entities, preventing stored XSS.
- **Why:** v1 used `<%- confession.text %>` which renders raw HTML. A confession containing `<script>alert('UMinho 0wned')</script>` executes in every visitor's browser when the feed loads.
- **Note on product requirement:** The original product requirement for HTML formatting (`<b>`, `<i>`, `<u>`) cannot be safely satisfied without a sanitization library. In this v2 spec, HTML formatting is intentionally disabled in favour of security. If formatting is needed in a future version, use a whitelist sanitizer.

### views/admin.ejs

Displays: list of all confessions with delete buttons.

- For each confession:
  - Text (escaped): `<%= confession.text %>`
  - Tag: `<%= confession.tag %>`
  - Timestamp: `<%= confession.created_at %>`
  - Delete button: `POST /admin/delete/<%= confession.id %>`
- Includes logout link: `GET /admin/logout`

#### Security Requirements
- **XSS prevention:** Use `<%= %>` for all user content (same as index.ejs).

### views/admin-login.ejs

Displays: login form for admin.

- Form: `POST /admin/login` with field `name="password"` (type="password")
- Shows `<%= error %>` if present

---

## 6. Behaviour Notes

- Feed is ordered newest-first (ORDER BY created_at DESC) *(unchanged)*
- Search with empty `q` returns all confessions *(unchanged)*
- SQL wildcards `%` and `_` in search input are passed through via parameterized query — they still work as LIKE wildcards but cannot inject SQL *(same behaviour, safe implementation)*
- `/admin` requires session authentication; unauthenticated access redirects to `/admin/login`
- App must work on first run: `npm install && node server.js`
- Database file: `confessions.db` in project root, created on startup *(unchanged)*
- Session secret: read from `process.env.SESSION_SECRET`, fallback to `'workshop-secret'` for local dev

---

## 7. Security Requirements (Cross-Cutting)

### 7.1 Session Setup

Configure `express-session` before route definitions:

```js
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET || 'workshop-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));
```

**Why:** `httpOnly: true` prevents JavaScript from reading the session cookie, blocking cookie theft via XSS even if a script somehow executes.

### 7.2 Authentication Middleware

Define `requireAuth` once and reuse it on `/admin` (GET) and `/admin/delete/:id` (POST):

```js
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  res.redirect('/admin/login');
}
```

**Why:** All admin actions must be gated by the same middleware. Forgetting to protect a single route re-exposes the attack surface.

### 7.3 Parameterized Queries (All Routes)

Every SQL query that includes user-supplied values MUST use `?` placeholders:

```js
// CORRECT
db.prepare('SELECT * FROM confessions WHERE text LIKE ?').all(`%${q}%`);

// WRONG — never do this
db.prepare(`SELECT * FROM confessions WHERE text LIKE '%${q}%'`).all();
```

**Why:** Parameterized queries separate SQL structure from data. The database driver handles escaping; the SQL structure cannot be altered by user input regardless of what characters it contains.

### 7.4 Output Encoding (All Templates)

All user-supplied content rendered in EJS templates MUST use `<%= %>`, not `<%- %>`.

| Context | Tag to use | Why |
|---|---|---|
| User confession text | `<%= %>` | Prevents stored XSS |
| User-supplied tag | `<%= %>` | Prevents stored XSS |
| Search query `q` echoed back | `<%= %>` | Prevents reflected XSS |

**Why:** `<%- %>` renders raw HTML. `<%= %>` HTML-encodes the value, turning `<script>` into `&lt;script&gt;` which the browser displays as text instead of executing.
