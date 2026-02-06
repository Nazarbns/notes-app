const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const JWT_SECRET = "tajny_klucz_jwt";

app.use(express.json());

// ===== BAZA DANYCH =====
const db = new sqlite3.Database("./database.db");

// Tabela notatek
db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL
  )
`);

// Tabela użytkowników
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )
`);

// ===== MIDDLEWARE JWT =====
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.sendStatus(403);
      return;
    }
    req.user = user;
    next();
  });
}

// ===== TEST ENDPOINT =====
app.get("/", (req, res) => {
  res.json({ message: "API działa poprawnie" });
});

// ===== AUTH =====

// Rejestracja
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Brak danych" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
    [email, hashedPassword, "user"],
    function (err) {
      if (err) {
        res.status(400).json({ error: "Użytkownik już istnieje" });
        return;
      }
      res.json({ message: "Rejestracja zakończona sukcesem" });
    }
  );
});

// Logowanie
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (!user) {
        res.status(401).json({ error: "Nieprawidłowe dane" });
        return;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        res.status(401).json({ error: "Nieprawidłowe dane" });
        return;
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    }
  );
});

// ===== NOTATKI (CRUD) =====

// GET – pobierz notatki (chronione)
app.get("/api/notes", authenticateToken, (req, res) => {
  db.all("SELECT * FROM notes", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST – dodaj notatkę
app.post("/api/notes", authenticateToken, (req, res) => {
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ error: "Brak treści notatki" });
    return;
  }

  db.run(
    "INSERT INTO notes (content) VALUES (?)",
    [content],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, content });
    }
  );
});

// DELETE – usuń notatkę
app.delete("/api/notes/:id", authenticateToken, (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM notes WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na porcie ${PORT}`);
});