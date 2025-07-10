const calendar = document.getElementById("calendar");

// ⚠️ ВСТАВ СЮДИ СВІЙ Google Web App URL
const ORIGINAL_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxnjyvas0m4_8_0q5pBWpRzDS-bI9X9prhUB_-FMDKeTi-ci1S-7Nbh6le1Gd1cqh8w4Q/exec';

// Додаємо corsproxy
const GOOGLE_SHEETS_WEB_APP_URL = 'https://corsproxy.io/?' + encodeURIComponent(ORIGINAL_WEB_APP_URL);

// Стартові дата
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();

// Відправка даних до Google Sheets
function saveToGoogleSheets(date, color) {
  fetch(GOOGLE_SHEETS_WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: date, color: color })
  })
    .then(res => res.text())
    .then(text => console.log('✅ Відповідь від Google Sheets:', text))
    .catch(error => console.error('❌ Помилка:', error));
}

// Синхронізація localStorage з Google Sheets
function syncLocalStorageToGoogleSheets() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
      const color = localStorage.getItem(key);
      saveToGoogleSheets(key, color || "");
    }
  }
  console.log("Синхронізацію завершено");
}

// Додає місяць у календар
function addMonth(year, month) {
  const monthBlock = document.createElement("div");
  monthBlock.className = "month-block";

  const monthName = document.createElement("div");
  monthName.className = "month-name";
  monthName.textContent = getMonthName(month) + " " + year;
  monthBlock.appendChild(monthName);

  // Додавання назв днів тижня
  const weekdays = document.createElement("div");
  weekdays.className = "weekdays";
  const weekdayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  for (let i = 0; i < 7; i++) {
    const weekday = document.createElement("div");
    weekday.textContent = weekdayNames[i];
    weekdays.appendChild(weekday);
  }
  monthBlock.appendChild(weekdays);

  const daysGrid = document.createElement("div");
  daysGrid.className = "days-grid";

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < offset; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "day";
    daysGrid.appendChild(emptyDay);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const day = document.createElement("div");
    day.className = "day";
    day.textContent = d;

    const key = `${year}-${month}-${d}`;
    const color = localStorage.getItem(key);
    if (color) {
      day.classList.add(color);
    }

    day.addEventListener("click", () => {
      document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
      day.classList.add("selected");
      openColorModal(year, month, d, day);
    });

    daysGrid.appendChild(day);
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

function openColorModal(year, month, dayNum, dayElement) {
  let modal = document.getElementById("colorModal");

  modal.style.display = "block";

  modal.querySelector(".close").onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = e => {
    if (e.target == modal) modal.style.display = "none";
  };

  const key = `${year}-${month}-${dayNum}`;

  modal.querySelector("#greenBtn").onclick = () => {
    dayElement.classList.remove("red", "green");
    dayElement.classList.add("green");
    localStorage.setItem(key, "green");
    saveToGoogleSheets(key, "green");
    modal.style.display = "none";
  };

  modal.querySelector("#redBtn").onclick = () => {
    dayElement.classList.remove("red", "green");
    dayElement.classList.add("red");
    localStorage.setItem(key, "red");
    saveToGoogleSheets(key, "red");
    modal.style.display = "none";
  };

  modal.querySelector("#clearBtn").onclick = () => {
    dayElement.classList.remove("red", "green");
    localStorage.removeItem(key);
    saveToGoogleSheets(key, "");
    modal.style.display = "none";
  };
}
