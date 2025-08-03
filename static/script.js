let currentYear = year;
let currentMonth = month;
let reminders = {};

async function loadReminders() {
  const res = await fetch("/api/reminders");
  reminders = await res.json();
  renderCalendar();
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  const monthYear = document.getElementById("month-year");
  calendar.innerHTML = "";

  const date = new Date(currentYear, currentMonth - 1, 1);
  const monthName = date.toLocaleString('default', { month: 'long' });
  monthYear.textContent = `${monthName} ${currentYear}`;

  const startDay = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const blankDays = (startDay + 6) % 7;
  for (let i = 0; i < blankDays; i++) {
    calendar.innerHTML += "<div></div>";
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const div = document.createElement("div");
    div.className = "day";
    if (reminders[dateKey]) div.classList.add("has-reminder");
    div.textContent = day;
    div.onclick = () => openModal(dateKey);
    calendar.appendChild(div);
  }
}

function changeMonth(diff) {
  currentMonth += diff;
  if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  } else if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  }
  renderCalendar();
}

function openModal(dateKey) {
  document.getElementById("reminder-modal").style.display = "block";
  document.getElementById("modal-date").textContent = dateKey;
  document.getElementById("reminder-text").value = "";
  const list = document.getElementById("reminder-list");
  list.innerHTML = "";

  (reminders[dateKey] || []).forEach((text, index) => {
    const li = document.createElement("li");
    li.textContent = text;
    li.onclick = () => deleteReminder(dateKey, index);
    list.appendChild(li);
  });
}

function closeModal() {
  document.getElementById("reminder-modal").style.display = "none";
}

async function addReminder() {
  const date = document.getElementById("modal-date").textContent;
  const text = document.getElementById("reminder-text").value;
  if (text.trim() === "") return;

  await fetch("/api/reminders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, text }),
  });

  await loadReminders();
  openModal(date);
}

async function deleteReminder(date, index) {
  await fetch("/api/reminders", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, index }),
  });

  await loadReminders();
  openModal(date);
}

window.onload = loadReminders;
