import {
  BASELINES,
  DEFAULT_PROFILE,
  WEB_DEFAULT_PROFILE,
  calculateEstimate,
  clamp,
  getPerspectiveRange,
  validateBirthDate
} from "./memento-core.js?v=2.0.0-r2";

const PROFILE_STORAGE_KEY = "memento-mori.web-profile.v2";
const INTENTION_STORAGE_KEY = "memento-mori.daily-intention.v1";
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 365.2425 / 12 * DAY_MS;
const COUNTRY_LABELS = {
  WLD: "Promedio mundial",
  USA: "Estados Unidos",
  GBR: "Reino Unido",
  DEU: "Alemania",
  ESP: "España",
  JPN: "Japón",
  IND: "India",
  BRA: "Brasil"
};

function required(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Falta un elemento obligatorio de la interfaz: ${selector}`);
  }
  return element;
}

const elements = {
  profileForm: required("#profile-form"),
  birthDate: required("#birth-date"),
  birthError: required("#birth-error"),
  country: required("#country"),
  reset: required("[data-reset]"),
  emptyResult: required("[data-empty-result]"),
  result: required("[data-result]"),
  horizonDate: required("[data-horizon-date]"),
  rangeStart: required("[data-range-start]"),
  rangeEnd: required("[data-range-end]"),
  yearsLeft: required("[data-years-left]"),
  weeksLeft: required("[data-weeks-left]"),
  daysLeft: required("[data-days-left]"),
  progressRing: required("[data-progress-ring]"),
  progressNumber: required("[data-progress-number]"),
  progressCopy: required("[data-progress-copy]"),
  liveReadout: required("[data-live-readout]"),
  perspective: required("[data-perspective]"),
  lifeGrid: required("[data-life-grid]"),
  gridCaption: required("[data-grid-caption]"),
  afternoons: required("[data-free-afternoons]"),
  meetings: required("[data-monthly-meetings]"),
  intentionSection: required("[data-intention-section]"),
  intentionForm: required("#intention-form"),
  intention: required("#intention"),
  characterCount: required("[data-character-count]"),
  savedIntention: required("[data-saved-intention]"),
  intentionText: required("[data-intention-text]"),
  complete: required("[data-complete]"),
  clearIntention: required("[data-clear-intention]"),
  copy: required("[data-copy]"),
  toast: required("[data-toast]"),
  storageStatus: required("[data-storage-status]")
};

let storageAvailable = true;
let currentEstimate = null;
let toastTimer = null;

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    storageAvailable = false;
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    storageAvailable = false;
    updateStorageStatus();
    showToast("El cálculo funciona, pero este navegador no permite guardar los datos.");
    return false;
  }
}

function removeStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    storageAvailable = false;
  }
}

function updateStorageStatus() {
  elements.storageStatus.textContent = storageAvailable
    ? "Solo en este dispositivo"
    : "Persistencia no disponible";
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function formatNumber(value) {
  return Math.max(0, Math.round(value)).toLocaleString("es-ES");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 4200);
}

function hydrateCountries() {
  elements.country.replaceChildren();
  for (const [code, baseline] of Object.entries(BASELINES)) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${COUNTRY_LABELS[code] || baseline.label} · ${baseline.years.toFixed(1)} años`;
    elements.country.append(option);
  }
}

function profileForEstimate() {
  const country = elements.country.value || WEB_DEFAULT_PROFILE.country;
  return {
    ...DEFAULT_PROFILE,
    birthDate: elements.birthDate.value,
    country,
    birthCountry: country,
    currentCountry: country
  };
}

function validateForm(now = new Date()) {
  const validation = validateBirthDate(elements.birthDate.value, now);
  elements.birthError.hidden = validation.valid;
  elements.birthError.textContent = validation.message;
  elements.birthDate.setAttribute("aria-invalid", String(!validation.valid));
  return validation.valid;
}

function renderLifeGrid(estimate) {
  const livedYears = clamp(Math.floor(estimate.ageYears), 0, 100);
  const centralYears = clamp(Math.ceil(estimate.lifeExpectancyYears), 0, 100);
  const rangeEndYears = clamp(Math.ceil(estimate.lifeExpectancyYears + 7), 0, 100);
  const fragment = document.createDocumentFragment();

  for (let year = 1; year <= 100; year += 1) {
    const cell = document.createElement("span");
    cell.className = "life-year";
    if (year <= livedYears) {
      cell.classList.add("lived");
    } else if (year <= centralYears) {
      cell.classList.add("remaining");
    } else if (year <= rangeEndYears) {
      cell.classList.add("range");
    }
    fragment.append(cell);
  }

  elements.lifeGrid.replaceChildren(fragment);
  elements.lifeGrid.setAttribute(
    "aria-label",
    `${livedYears} años vividos y un horizonte central de ${Math.round(estimate.lifeExpectancyYears)} años, con margen de siete años.`
  );
  elements.gridCaption.textContent = `Has vivido aproximadamente ${livedYears} años. El horizonte central ocupa hasta los ${Math.round(estimate.lifeExpectancyYears)}; el contorno prolonga el margen hasta los ${Math.round(estimate.lifeExpectancyYears + 7)}.`;
}

function renderEstimate(estimate, now) {
  const range = getPerspectiveRange(estimate);
  const remainingMs = Math.max(0, estimate.remainingMs);
  const exactYears = remainingMs / (365.2425 * DAY_MS);
  const progressPercent = Math.round(estimate.progress * 100);

  currentEstimate = estimate;
  elements.emptyResult.hidden = true;
  elements.result.hidden = false;
  elements.reset.hidden = false;
  elements.perspective.hidden = false;
  elements.intentionSection.hidden = false;
  elements.horizonDate.textContent = formatDate(estimate.deathDate);
  elements.rangeStart.textContent = formatDate(range.start);
  elements.rangeEnd.textContent = formatDate(range.end);
  elements.yearsLeft.textContent = exactYears.toLocaleString("es-ES", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1
  });
  elements.weeksLeft.textContent = formatNumber(remainingMs / WEEK_MS);
  elements.daysLeft.textContent = formatNumber(remainingMs / DAY_MS);
  elements.progressRing.style.setProperty("--progress", `${progressPercent * 3.6}deg`);
  elements.progressNumber.textContent = `${progressPercent}%`;
  elements.progressCopy.textContent = `${progressPercent}%`;
  elements.liveReadout.textContent = `Referencia actualizada el ${new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(now)}.`;
  elements.afternoons.textContent = formatNumber(remainingMs / WEEK_MS);
  elements.meetings.textContent = formatNumber(remainingMs / MONTH_MS);
  renderLifeGrid(estimate);
}

function clearEstimate() {
  currentEstimate = null;
  elements.emptyResult.hidden = false;
  elements.result.hidden = true;
  elements.reset.hidden = true;
  elements.perspective.hidden = true;
  elements.intentionSection.hidden = true;
  elements.lifeGrid.replaceChildren();
}

function calculateAndRender({ persist = true, announce = false } = {}) {
  const now = new Date();
  if (!validateForm(now)) {
    clearEstimate();
    elements.birthDate.focus();
    return false;
  }

  const profile = profileForEstimate();
  const estimate = calculateEstimate(profile, now);
  renderEstimate(estimate, now);
  if (persist) {
    writeStorage(PROFILE_STORAGE_KEY, {
      birthDate: profile.birthDate,
      country: profile.country
    });
  }
  if (announce) {
    showToast("Perspectiva calculada y guardada en este dispositivo.");
  }
  return true;
}

function renderIntention(value) {
  const text = typeof value?.text === "string" ? value.text.trim() : "";
  const completed = Boolean(value?.completed);
  elements.intention.value = text;
  elements.characterCount.value = String(text.length);
  elements.savedIntention.hidden = !text;
  elements.intentionText.textContent = text;
  elements.complete.setAttribute("aria-pressed", String(completed));
  elements.complete.setAttribute(
    "aria-label",
    completed ? "Marcar intención como pendiente" : "Marcar intención como completada"
  );
}

function loadInitialState() {
  hydrateCountries();
  const storedProfile = readStorage(PROFILE_STORAGE_KEY, WEB_DEFAULT_PROFILE);
  const storedIntention = readStorage(INTENTION_STORAGE_KEY, { text: "", completed: false });
  elements.birthDate.max = toInputDate(new Date());
  elements.birthDate.value = typeof storedProfile.birthDate === "string" ? storedProfile.birthDate : "";
  elements.country.value = BASELINES[storedProfile.country] ? storedProfile.country : WEB_DEFAULT_PROFILE.country;
  updateStorageStatus();
  renderIntention(storedIntention);

  if (elements.birthDate.value && validateBirthDate(elements.birthDate.value).valid) {
    calculateAndRender({ persist: false });
  } else {
    clearEstimate();
  }
}

elements.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateAndRender({ announce: true });
});

elements.birthDate.addEventListener("input", () => {
  if (!elements.birthError.hidden) {
    validateForm();
  }
});

elements.reset.addEventListener("click", () => {
  const confirmed = window.confirm("¿Borrar tu fecha, país e intención guardados en este dispositivo?");
  if (!confirmed) {
    return;
  }
  removeStorage(PROFILE_STORAGE_KEY);
  removeStorage(INTENTION_STORAGE_KEY);
  elements.birthDate.value = "";
  elements.country.value = WEB_DEFAULT_PROFILE.country;
  elements.birthError.hidden = true;
  elements.birthDate.setAttribute("aria-invalid", "false");
  renderIntention({ text: "", completed: false });
  clearEstimate();
  showToast("Datos locales eliminados.");
});

elements.intention.addEventListener("input", () => {
  elements.characterCount.value = String(elements.intention.value.length);
});

elements.intentionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.intention.value.trim();
  if (!text) {
    showToast("Escribe una intención concreta antes de guardarla.");
    elements.intention.focus();
    return;
  }
  const value = { text, completed: false, savedAt: new Date().toISOString() };
  writeStorage(INTENTION_STORAGE_KEY, value);
  renderIntention(value);
  showToast("Intención guardada en este dispositivo.");
});

elements.complete.addEventListener("click", () => {
  const value = {
    text: elements.intentionText.textContent.trim(),
    completed: elements.complete.getAttribute("aria-pressed") !== "true",
    savedAt: new Date().toISOString()
  };
  writeStorage(INTENTION_STORAGE_KEY, value);
  renderIntention(value);
});

elements.clearIntention.addEventListener("click", () => {
  removeStorage(INTENTION_STORAGE_KEY);
  renderIntention({ text: "", completed: false });
  showToast("Intención eliminada.");
});

elements.copy.addEventListener("click", async () => {
  if (!currentEstimate) {
    return;
  }
  const range = getPerspectiveRange(currentEstimate);
  const summary = [
    "Mi tiempo en perspectiva · Memento Mori",
    `Horizonte poblacional central: ${formatDate(currentEstimate.deathDate)}`,
    `Rango amplio: ${formatDate(range.start)} — ${formatDate(range.end)}`,
    "No es una predicción individual. memento.technoir.cloud"
  ].join("\n");

  try {
    await navigator.clipboard.writeText(summary);
    showToast("Resumen copiado sin incluir tu fecha de nacimiento.");
  } catch {
    showToast("No se pudo acceder al portapapeles. Puedes copiar la fecha visible.");
  }
});

loadInitialState();
