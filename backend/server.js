const express = require("express");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "API działa poprawnie" });
});

// API – notatki
app.get("/api/notes", (req, res) => {
  const notes = [
    { id: 1, content: "Przykładowa notatka z backendu" }
  ];
  res.json(notes);
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na porcie ${PORT}`);
});