(() => {
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const colons = document.querySelectorAll(".colon");
  const timeDisplayEl = document.getElementById("time-display");
  const dateDisplayEl = document.getElementById("date-display");
  const tzDisplayEl = document.getElementById("tz-display");
  const periodBadgeEl = document.getElementById("period-badge");
  const secondCounterEl = document.getElementById("second-counter");
  const secondProgressEl = document.getElementById("second-progress");
  const formatToggleBtn = document.getElementById("format-toggle");
  const themeToggleBtn = document.getElementById("theme-toggle");

  let is24Hour = true;
  let isLightTheme = false;

  /**
   * Pads a number to at least 2 digits with a leading zero.
   * @param {number} value
   * @returns {string}
   */
  function padZero(value) {
    return String(value).padStart(2, "0");
  }

  /**
   * Formats the local UTC offset (e.g., UTC+9, UTC-5:30).
   * @param {Date} date
   * @returns {string}
   */
  function formatUtcOffset(date) {
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absMinutes = Math.abs(offsetMinutes);
    const offsetHours = Math.floor(absMinutes / 60);
    const remMinutes = absMinutes % 60;
    return remMinutes === 0
      ? `UTC${sign}${offsetHours}`
      : `UTC${sign}${offsetHours}:${padZero(remMinutes)}`;
  }

  /**
   * Formats the current date cleanly using the browser's locale.
   * @param {Date} date
   * @returns {string}
   */
  function formatDate(date) {
    const locale = navigator.language || "ko-KR";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
  }

  /**
   * Renders the current time, date, and second progress bar into the DOM.
   */
  function renderClock() {
    const now = new Date();
    const rawHours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    let displayHours = rawHours;
    if (!is24Hour) {
      displayHours = rawHours % 12 || 12;
      periodBadgeEl.textContent = rawHours >= 12 ? "PM" : "AM";
      periodBadgeEl.classList.remove("is-hidden");
    } else {
      periodBadgeEl.classList.add("is-hidden");
    }

    const hh = padZero(displayHours);
    const mm = padZero(minutes);
    const ss = padZero(seconds);

    hoursEl.textContent = hh;
    minutesEl.textContent = mm;
    secondsEl.textContent = ss;
    timeDisplayEl.setAttribute("datetime", now.toISOString());

    const isEvenSecond = seconds % 2 === 0;
    colons.forEach((colon) => {
      colon.classList.toggle("is-dim", !isEvenSecond);
    });

    dateDisplayEl.textContent = formatDate(now);
    dateDisplayEl.setAttribute("datetime", `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`);
    tzDisplayEl.textContent = formatUtcOffset(now);

    const progressPct = ((seconds + 1) / 60) * 100;
    secondProgressEl.style.width = `${progressPct.toFixed(2)}%`;
    secondCounterEl.textContent = `${ss} / 60s`;
  }

  /**
   * Schedules the next update aligned to the next wall-clock second boundary.
   */
  function scheduleNextTick() {
    const delayMs = 1000 - (Date.now() % 1000) + 5;
    window.setTimeout(() => {
      renderClock();
      scheduleNextTick();
    }, delayMs);
  }

  formatToggleBtn.addEventListener("click", () => {
    is24Hour = !is24Hour;
    formatToggleBtn.textContent = is24Hour ? "24H" : "12H";
    formatToggleBtn.setAttribute("aria-pressed", String(!is24Hour));
    renderClock();
  });

  themeToggleBtn.addEventListener("click", () => {
    isLightTheme = !isLightTheme;
    document.body.classList.toggle("theme-light", isLightTheme);
    themeToggleBtn.textContent = isLightTheme ? "Dark" : "Light";
    themeToggleBtn.setAttribute("aria-pressed", String(isLightTheme));
  });

  renderClock();
  scheduleNextTick();
})();
