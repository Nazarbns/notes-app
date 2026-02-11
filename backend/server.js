const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = "jwt_secret_key";

app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL
    )
  `);
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Brak tokenu" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Nieprawidłowy token" });
    req.user = user;
    next();
  });
}

// REGISTER
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashed],
    err => {
      if (err) return res.status(400).json({ error: "Użytkownik już istnieje" });
      res.json({ message: "OK" });
    }
  );
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (_, user) => {
      if (!user) return res.status(401).json({ error: "Nieprawidłowe dane" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: "Nieprawidłowe dane" });

      const token = jwt.sign({ id: user.id }, JWT_SECRET);
      res.json({ token });
    }
  );
});

// GET NOTES
app.get("/api/notes", authenticate, (req, res) => {
  db.all(
    "SELECT id, content FROM notes WHERE user_id = ?",
    [req.user.id],
    (_, rows) => res.json(rows)
  );
});

// ADD NOTE
app.post("/api/notes", authenticate, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Pusta notatka" });

  db.run(
    "INSERT INTO notes (content, user_id) VALUES (?, ?)",
    [content, req.user.id],
    () => res.json({ success: true })
  );
});

// UPDATE NOTE
app.put("/api/notes/:id", authenticate, (req, res) => {
  const { content } = req.body;

  db.run(
    "UPDATE notes SET content = ? WHERE id = ? AND user_id = ?",
    [content, req.params.id, req.user.id],
    function () {
      if (this.changes === 0)
        return res.status(404).json({ error: "Notatka nie znaleziona" });

      res.json({ success: true });
    }
  );
});

// DELETE NOTE
app.delete("/api/notes/:id", authenticate, (req, res) => {
  db.run(
    "DELETE FROM notes WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    function () {
      if (this.changes === 0)
        return res.status(404).json({ error: "Notatka nie znaleziona" });

      res.json({ success: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na porcie ${PORT}`);
});
