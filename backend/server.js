const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 3000;

app.use(express.json());

// Baza danych
const db = new sqlite3.Database("./database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL
  )
`);

// GET – pobierz wszystkie notatki
app.get("/api/notes", (req, res) => {
  db.all("SELECT * FROM notes", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST – dodaj notatkę
app.post("/api/notes", (req, res) => {
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
app.delete("/api/notes/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM notes WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na porcie ${PORT}`);
});