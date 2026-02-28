const calendar = document.getElementById("calendar");
const monthDisplay = document.getElementById("monthDisplay");
const yearSelect = document.getElementById("yearSelect");
const eventList = document.getElementById("eventList");
const eventDetails = document.getElementById("eventDetails");

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = 2026;

const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

let events = {};

fetch("/get-events")
    .then(response => response.json())
    .then(data => {
        events = data;
        generateCalendar();
    });

/* Populate Years */
for (let y = 2024; y <= 2030; y++) {
    let option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    if (y === currentYear) option.selected = true;
    yearSelect.appendChild(option);
}

yearSelect.addEventListener("change", () => {
    currentYear = parseInt(yearSelect.value);
    generateCalendar();
    clearEvents();
});

document.getElementById("prevMonth").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
        yearSelect.value = currentYear;
    }
    generateCalendar();
    clearEvents();
});

document.getElementById("nextMonth").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
        yearSelect.value = currentYear;
    }
    generateCalendar();
    clearEvents();
});

function generateCalendar() {

    calendar.innerHTML = `
        <div class="day-name">Sun</div>
        <div class="day-name">Mon</div>
        <div class="day-name">Tue</div>
        <div class="day-name">Wed</div>
        <div class="day-name">Thu</div>
        <div class="day-name">Fri</div>
        <div class="day-name">Sat</div>
    `;

    monthDisplay.textContent = months[currentMonth];

    let firstDay = new Date(currentYear, currentMonth, 1).getDay();
    let totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= totalDays; day++) {

        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        dayDiv.textContent = day;

        let monthFormatted = String(currentMonth + 1).padStart(2, '0');
let dayFormatted = String(day).padStart(2, '0');
let key = `${currentYear}-${monthFormatted}-${dayFormatted}`;
        /* Highlight Today */
        let today = new Date();
        if (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        ) {
            dayDiv.classList.add("today");
        }

        if (events[key]) {
            const badge = document.createElement("div");
            badge.classList.add("event-badge");
            dayDiv.appendChild(badge);
        }

        dayDiv.addEventListener("click", () => showEvents(key));
        calendar.appendChild(dayDiv);
    }
}

function showEvents(key) {
    eventList.innerHTML = "";

    if (events[key]) {
        events[key].forEach(event => {
            const li = document.createElement("li");

            let link = event.link;

            if (!link.startsWith("http://") && !link.startsWith("https://")) {
                link = "https://" + link;
            }

            li.innerHTML = `
                <strong>${event.name}</strong>
                <a href="${link}" target="_blank"> View</a>
            `;
            
            eventList.appendChild(li);
        });
    } else {
        clearEvents();
    }
}

function clearEvents() {
    eventList.innerHTML = "";
}

generateCalendar();
