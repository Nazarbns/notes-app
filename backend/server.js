const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = loginForm.querySelector("input[type='email']").value;
    const password = loginForm.querySelector("input[type='password']").value;

    if (!email || !password) {
      alert("Proszę wypełnić wszystkie pola.");
      return;
    }

    alert("Logowanie zakończone sukcesem.");
    window.location.href = "dashboard.html";
  });
}

const notesList = document.getElementById("notesList");
const addNoteButton = document.querySelector("button");

if (addNoteButton && notesList) {
  addNoteButton.addEventListener("click", () => {
    const text = prompt("Wpisz treść notatki:");
    if (!text) return;

    const li = document.createElement("li");
    li.textContent = text;
    notesList.appendChild(li);
  });
}

async function loadNotes() {
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
  } catch (err) {
    console.error("Błąd pobierania notatek", err);
  }
}

if (notesList) {
  loadNotes();
}