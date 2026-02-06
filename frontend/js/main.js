// Logowanie – obsługa formularza
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = loginForm.querySelector("input[type='email']").value;
    const password = loginForm.querySelector("input[type='password']").value;

    if (email === "" || password === "") {
      alert("Proszę wypełnić wszystkie pola.");
      return;
    }

    alert("Logowanie zakończone sukcesem (symulacja).");
    window.location.href = "dashboard.html";
  });
}

// Panel użytkownika – notatki
const notesList = document.getElementById("notesList");
const addNoteButton = document.querySelector("button");

if (addNoteButton && notesList) {
  addNoteButton.addEventListener("click", function () {
    const noteText = prompt("Wpisz treść notatki:");

    if (!noteText) {
      return;
    }

    const li = document.createElement("li");
    li.textContent = noteText;

    notesList.appendChild(li);
  });
}