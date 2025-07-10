// Firebase конфігурація
firebase.initializeApp({
  apiKey: "AIzaSyBd9HRH02unYa80SKmCPZ1TxiiSXpVJv_I",
  authDomain: "bogdan-fbabf.firebaseapp.com",
  databaseURL: "https://bogdan-fbabf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bogdan-fbabf",
  storageBucket: "bogdan-fbabf.appspot.com",
  messagingSenderId: "613317674051",
  appId: "1:613317674051:web:56c679e573c6be86b680f6"
});

const db = firebase.database();

// Авторизація
document.getElementById("loginBtn").onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("loginContainer").style.display = "none";
      document.getElementById("calendarContainer").style.display = "block";
      initCalendar();
    })
    .catch(() => {
      alert("Невірний логін або пароль");
    });
};

// Вихід
document.getElementById("logoutBtn").onclick = () => {
  firebase.auth().signOut().then(() => {
    document.getElementById("calendarContainer").style.display = "none";
    document.getElementById("loginContainer").style.display = "block";
    document.getElementById("calendar").innerHTML = "";
  });
};

function initCalendar() {
  const calendar = document.getElementById("calendar");
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth();
  let cellMap = {};

  function addMonth(year, month) {
    const monthBlock = document.createElement("div");
    monthBlock.className = "month-block";

    const monthName = document.createElement("div");
    monthName.className = "month-name";
    monthName.textContent = getMonthName(month) + " " + year;
    monthBlock.appendChild(monthName);

    const daysGrid = document.createElement("div");
    daysGrid.className = "days-grid";

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const day = document.createElement("div");
      day.className = "day";
      day.textContent = d;

      const key = `${year}-${month}-${d}`;
      const status = localStorage.getItem(key);
      if (status) day.classList.add(status);

      day.addEventListener("click", () => {
        document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
        day.classList.add("selected");
        openStatusModal(year, month, d, day);
      });

      daysGrid.appendChild(day);
      cellMap[key] = day;
    }

    monthBlock.appendChild(daysGrid);
    calendar.appendChild(monthBlock);
  }

  function getMonthName(month) {
    const months = [
      "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
      "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
    ];
    return months[month];
  }

  for (let i = 0; i <= 1; i++) {
    let tempMonth = (currentMonth + i) % 12;
    let tempYear = currentYear + Math.floor((currentMonth + i) / 12);
    addMonth(tempYear, tempMonth);
  }
  currentMonth = (currentMonth + 2) % 12;
  if (currentMonth < 2) currentYear++;

  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      addMonth(currentYear, currentMonth);
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }
  });

  function openStatusModal(year, month, dayNum, dayElement) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.display = "block";

    const content = document.createElement("div");
    content.className = "modal-content";
    content.innerHTML = `
      <h3>Вибери статус</h3>
      <button id="fullDay">Цілий день</button>
      <button id="halfDay">Пів дня</button>
      <button id="clear">Очистити</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    const key = `${year}-${month}-${dayNum}`;

    document.getElementById("fullDay").onclick = () => {
      localStorage.setItem(key, "full");
      db.ref('calendarData/' + key).set("full");
      dayElement.classList.remove("half");
      dayElement.classList.add("full");
      closeModal(modal);
    };

    document.getElementById("halfDay").onclick = () => {
      localStorage.setItem(key, "half");
      db.ref('calendarData/' + key).set("half");
      dayElement.classList.remove("full");
      dayElement.classList.add("half");
      closeModal(modal);
    };

    document.getElementById("clear").onclick = () => {
      localStorage.removeItem(key);
      db.ref('calendarData/' + key).remove();
      dayElement.classList.remove("full", "half");
      closeModal(modal);
    };

    window.onclick = e => {
      if (e.target == modal) closeModal(modal);
    };
  }

  function closeModal(modal) {
    modal.remove();
  }

  // Завантаження з Firebase → localStorage
  db.ref('calendarData').once('value').then(snapshot => {
    const data = snapshot.val();
    for (let key in data) {
      const status = data[key];
      localStorage.setItem(key, status);
      if (cellMap[key]) {
        cellMap[key].classList.add(status);
      }
    }
  });
}
