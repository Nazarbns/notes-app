const API_URL = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

/* ================= REGISTER ================= */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = registerForm.querySelector("input[type='email']").value;
    const password = registerForm.querySelector("input[type='password']").value;

    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Błąd rejestracji");
      return;
    }

    alert("Rejestracja zakończona sukcesem");
    window.location.href = "login.html";
  });
}

/* ================= LOGIN ================= */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector("input[type='email']").value;
    const password = loginForm.querySelector("input[type='password']").value;

    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Nieprawidłowe dane logowania");
      return;
    }

    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html";
  });
}

/* ================= DASHBOARD ================= */
const notesList = document.getElementById("notesList");

if (notesList && !getToken()) {
  window.location.href = "login.html";
}

async function loadNotes() {
  const res = await fetch(`${API_URL}/api/notes`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  if (!res.ok) {
    notesList.innerHTML = "<li>Błąd ładowania notatek</li>";
    return;
  }

  const notes = await res.json();
  notesList.innerHTML = "";

  if (notes.length === 0) {
    notesList.innerHTML = "<li>Brak notatek</li>";
    return;
  }

  notes.forEach(note => {
    const li = document.createElement("li");

    const textSpan = document.createElement("span");
    textSpan.textContent = note.content;
    textSpan.style.marginRight = "10px";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edytuj";
    editBtn.style.marginRight = "6px";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Usuń";

    /* ===== DELETE ===== */
    deleteBtn.addEventListener("click", async () => {
      await fetch(`${API_URL}/api/notes/${note.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      loadNotes();
    });

    /* ===== UPDATE ===== */
    editBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.value = note.content;
      input.style.marginRight = "6px";

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Zapisz";

      li.innerHTML = "";
      li.appendChild(input);
      li.appendChild(saveBtn);

      saveBtn.addEventListener("click", async () => {
        const newContent = input.value.trim();
        if (!newContent) return;

        await fetch(`${API_URL}/api/notes/${note.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({ content: newContent })
        });

        loadNotes();
      });
    });

    li.appendChild(textSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    notesList.appendChild(li);
  });
}

/* ================= ADD NOTE ================= */
const addNoteBtn = document.getElementById("addNoteBtn");
const noteInput = document.getElementById("noteInput");

if (addNoteBtn && noteInput && notesList) {
  addNoteBtn.addEventListener("click", async () => {
    const content = noteInput.value.trim();

    if (!content) {
      alert("Wpisz treść notatki");
      return;
    }

    const res = await fetch(`${API_URL}/api/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ content })
    });

    if (!res.ok) {
      alert("Nie udało się dodać notatki");
      return;
    }

    noteInput.value = "";
    loadNotes();
  });

  loadNotes();
}

/* ================= LOGOUT ================= */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });
}
