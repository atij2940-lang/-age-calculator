const form = document.getElementById("ageForm");
const dobInput = document.getElementById("dob");
const error = document.getElementById("error");
const result = document.getElementById("result");

const yearsEl = document.getElementById("years");
const monthsEl = document.getElementById("months");
const daysEl = document.getElementById("days");
const nextBirthdayEl = document.getElementById("nextBirthday");
const daysUntilEl = document.getElementById("daysUntil");
const totalDaysEl = document.getElementById("totalDays");

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(a, b) {
  const ms = startOfDay(b) - startOfDay(a);
  return Math.round(ms / 86400000);
}

function addYearsSafe(date, years) {
  const result = new Date(date);
  result.setFullYear(date.getFullYear() + years);

  // Handle Feb 29 birthdays in non-leap years.
  if (date.getMonth() === 1 && date.getDate() === 29 && result.getMonth() !== 1) {
    result.setMonth(1, 28);
  }
  return result;
}

function calculateAge(birth, today) {
  let years = today.getFullYear() - birth.getFullYear();
  let anniversary = addYearsSafe(birth, years);

  if (anniversary > today) {
    years--;
    anniversary = addYearsSafe(birth, years);
  }

  let months = today.getMonth() - anniversary.getMonth();
  if (months < 0) months += 12;

  let monthStart = new Date(anniversary);
  monthStart.setMonth(anniversary.getMonth() + months);

  let days = today.getDate() - monthStart.getDate();
  if (days < 0) {
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += previousMonth.getDate();
  }

  return { years, months, days };
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function getNextBirthday(birth, today) {
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());

  // Feb 29: use Feb 28 in non-leap years.
  if (birth.getMonth() === 1 && birth.getDate() === 29 && next.getMonth() !== 1) {
    next = new Date(today.getFullYear(), 1, 28);
  }

  if (next < startOfDay(today)) {
    next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    if (birth.getMonth() === 1 && birth.getDate() === 29 && next.getMonth() !== 1) {
      next = new Date(today.getFullYear() + 1, 1, 28);
    }
  }

  return next;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  error.textContent = "";

  if (!dobInput.value) {
    error.textContent = "Please select your date of birth.";
    result.classList.add("hidden");
    return;
  }

  const birth = parseLocalDate(dobInput.value);
  const today = startOfDay(new Date());

  if (Number.isNaN(birth.getTime())) {
    error.textContent = "Please enter a valid date.";
    result.classList.add("hidden");
    return;
  }

  if (birth > today) {
    error.textContent = "Date of birth cannot be in the future.";
    result.classList.add("hidden");
    return;
  }

  const age = calculateAge(birth, today);
  const nextBirthday = getNextBirthday(birth, today);

  yearsEl.textContent = age.years;
  monthsEl.textContent = age.months;
  daysEl.textContent = age.days;

  nextBirthdayEl.textContent = formatDate(nextBirthday);

  const until = daysBetween(today, nextBirthday);
  daysUntilEl.textContent = until === 0 ? "Today 🎉" : `${until} day${until === 1 ? "" : "s"}`;

  totalDaysEl.textContent = daysBetween(birth, today).toLocaleString();

  result.classList.remove("hidden");
});
