import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// Firebase конфіг
const firebaseConfig = {
  apiKey: "AIzaSyBd9HRH02unYa80SKmCPZ1TxiiSXpVJv_I",
  authDomain: "bogdan-fbabf.firebaseapp.com",
  databaseURL: "https://bogdan-fbabf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bogdan-fbabf",
  storageBucket: "bogdan-fbabf.firebasestorage.app",
  messagingSenderId: "613317674051",
  appId: "1:613317674051:web:56c679e573c6be86b680f6",
  measurementId: "G-4CW4T1P3WY"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function saveToFirebase(date, color) {
  const dataRef = ref(database, 'calendarData');
  push(dataRef, { date, color, timestamp: Date.now() });
  console.log("📤 Firebase:", date, color);
}

document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");
  const modal = document.getElementById("colorModal");
  const greenBtn = document.getElementById("greenBtn");
  const redBtn = document.getElementById("redBtn");
  const clearBtn = document.getElementById("clearBtn");
  const closeModal = document.querySelector(".close");

  let selectedCell = null;

  function createCalendar(monthOffset = 0) {
    const now = new Date();
    now.setMonth(now.getMonth() + monthOffset);
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const calendar = document.createElement("div");
    calendar.className = "calendar-month";

    const title = document.createElement("h3");
    title.textContent = now.toLocaleString("uk-UA", {
      year: "numeric",
      month: "long",
    });
    calendar.appendChild(title);

    const table = document.createElement("table");
    const daysRow = document.createElement("tr");
    ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].forEach((day) => {
      const th = document.createElement("th");
      th.textContent = day;
      daysRow.appendChild(th);
    });
    table.appendChild(daysRow);

    let date = 1;
    for (let i = 0; i < 6; i++) {
      const row = document.createElement("tr");
      for (let j = 1; j <= 7; j++) {
        const cell = document.createElement("td");
        if ((i === 0 && j < (firstDay || 7)) || date > lastDate) {
          cell.textContent = "";
        } else {
          cell.textContent = date;
          const fullDate = `${year}-${month + 1}-${date}`;
          cell.dataset.date = fullDate;

          cell.addEventListener("click", () => {
            selectedCell = cell;
            modal.style.display = "block";
          });

          date++;
        }
        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    calendar.appendChild(table);
    calendarEl.appendChild(calendar);
  }

  createCalendar(0);
  createCalendar(1); // наступний місяць

  closeModal.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => {
    if (e.target == modal) modal.style.display = "none";
  };

  greenBtn.onclick = () => {
    if (selectedCell) {
      selectedCell.style.backgroundColor = "#4caf50";
      saveToFirebase(selectedCell.dataset.date, "green");
    }
    modal.style.display = "none";
  };

  redBtn.onclick = () => {
    if (selectedCell) {
      selectedCell.style.backgroundColor = "#f44336";
      saveToFirebase(selectedCell.dataset.date, "red");
    }
    modal.style.display = "none";
  };

  clearBtn.onclick = () => {
    if (selectedCell) {
      selectedCell.style.backgroundColor = "";
      saveToFirebase(selectedCell.dataset.date, "clear");
    }
    modal.style.display = "none";
  };
});
