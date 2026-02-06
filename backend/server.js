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
// Pobieranie notatek z backendu
async function loadNotesFromApi() {
  try {
    const response = await fetch("http://localhost:3000/api/notes");
    const notes = await response.json();

    if (!notesList) return;

    notesList.innerHTML = "";

    notes.forEach(note => {
      const li = document.createElement("li");
      li.textContent = note.content;
      notesList.appendChild(li);
    });
  } catch (error) {
    console.error("Błąd podczas pobierania notatek:", error);
  }
}

if (notesList) {
  loadNotesFromApi();
}
