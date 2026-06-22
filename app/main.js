import {
  BASELINES,
  DEFAULT_PROFILE,
  buildWaybarPayload,
  calculateEstimate,
  formatDate,
  splitDuration
} from "./memento-core.js";

const STORAGE_KEY = "memento-mori.profile.v1";
const SKINS = ["system-light", "system-dark"];
const SKIN_ALIASES = {
  system: "system-light",
  bone: "system-light",
  onyx: "system-dark"
};

const fields = [
  "birthDate",
  "birthCountry",
  "currentCountry",
  "moveAge"
];

function queryRequired(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required UI element: ${selector}`);
  }
  return element;
}

const els = {
  now: document.querySelectorAll("[data-now]"),
  birthCountry: queryRequired("#birthCountry"),
  currentCountry: queryRequired("#currentCountry"),
  countdown: queryRequired("[data-countdown]"),
  widgetTexts: document.querySelectorAll("[data-widget-text]"),
  widgetProgresses: document.querySelectorAll("[data-widget-progress]"),
  widgetShells: document.querySelectorAll("[data-widget-shell]"),
  deathDate: queryRequired("[data-death-date]"),
  lifeYears: queryRequired("[data-life-years]"),
  baseline: queryRequired("[data-baseline]"),
  progressLabels: document.querySelectorAll("[data-progress]"),
  delta: queryRequired("[data-delta]"),
  disclaimer: queryRequired("[data-disclaimer]"),
  contextMenu: queryRequired("[data-context-menu]"),
  reflectionCard: queryRequired("[data-reflection-card]"),
  reflectionTexts: document.querySelectorAll("[data-reflection-text]"),
  toast: queryRequired("[data-reflection-toast]"),
  toastText: queryRequired("[data-toast-text]"),
  appPanel: queryRequired("[data-app-panel]"),
  panelDockWidget: queryRequired("[data-panel-dock-widget]"),
  panelToggleButton: queryRequired("[data-action='toggle-panel']")
};

let profile = loadProfile();
let lastReflectionBucket = "";
let panelOpen = true;

function normalizeSkin(skin) {
  if (SKINS.includes(skin)) {
    return skin;
  }
  return SKIN_ALIASES[skin] || "system-light";
}

function loadProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      ...DEFAULT_PROFILE,
      birthCountry: DEFAULT_PROFILE.birthCountry || DEFAULT_PROFILE.country,
      currentCountry: DEFAULT_PROFILE.currentCountry || DEFAULT_PROFILE.country,
      ...stored,
      skin: normalizeSkin(stored?.skin || DEFAULT_PROFILE.skin)
    };
  } catch {
    return { ...DEFAULT_PROFILE, skin: normalizeSkin(DEFAULT_PROFILE.skin) };
  }
}

function saveProfile() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function hydrateCountrySelect(select) {
  Object.entries(BASELINES).forEach(([code, item]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${item.label} (${item.years.toFixed(1)}y)`;
    select.append(option);
  });
}

function hydrateCountries() {
  hydrateCountrySelect(els.birthCountry);
  hydrateCountrySelect(els.currentCountry);
}

function hydrateFields() {
  fields.forEach((name) => {
    const input = document.querySelector(`[name="${name}"]`);
    if (input && profile[name] !== undefined) {
      input.value = profile[name];
    }
  });
  hydrateCheckRows();
  setSkin(profile.skin || "system-light");
}

function collectFields() {
  fields.forEach((name) => {
    const input = document.querySelector(`[name="${name}"]`);
    if (input) {
      profile[name] = input.value;
    }
  });
  document.querySelectorAll("[data-factor]").forEach((input) => {
    if (input.checked) {
      profile[input.dataset.factor] = input.value;
    }
  });
}

function hydrateCheckRows() {
  document.querySelectorAll("[data-factor]").forEach((input) => {
    input.checked = profile[input.dataset.factor] === input.value;
  });
}

function setFactor(input) {
  const factor = input.dataset.factor;
  if (input.checked) {
    document.querySelectorAll(`[data-factor="${factor}"]`).forEach((peer) => {
      if (peer !== input) {
        peer.checked = false;
      }
    });
    profile[factor] = input.value;
  } else {
    profile[factor] = "skip";
  }
}

function formatPlainReadout(ms) {
  const parts = splitDuration(ms);
  const prefix = ms < 0 ? "+" : "";
  return `${prefix}${parts.years}y ${parts.days}d ${parts.hours}h ${parts.minutes}m ${parts.seconds}s`;
}

function setSkin(skin) {
  profile.skin = normalizeSkin(skin);
  document.documentElement.dataset.skin = profile.skin;
  document.querySelectorAll("[data-action='toggle-skin']").forEach((button) => {
    button.dataset.activeSkin = profile.skin;
    button.setAttribute("aria-pressed", profile.skin === "system-dark" ? "true" : "false");
  });
}

function toggleSkin() {
  setSkin(profile.skin === "system-dark" ? "system-light" : "system-dark");
}

function setPanelOpen(nextOpen) {
  panelOpen = nextOpen;
  els.appPanel.hidden = !panelOpen;
  els.panelDockWidget.hidden = panelOpen;
  els.appPanel.classList.toggle("is-maximized", panelOpen);
  els.panelToggleButton.textContent = panelOpen ? "Minimize" : "Open window";
}

function reflectionFor(now) {
  const hour = now.getHours();
  const pool = [
    {
      text: "Unless the plan is to become excellent at postponing your life."
    },
    {
      text: "Make the bed. Tiny empire, low taxes, immediate regime change."
    },
    {
      text: "You are not owed a calmer season. Adorable theory, though."
    },
    {
      text: "The obstacle is probably not fate. Check the task you are avoiding."
    },
    {
      text: "If it is late enough to doomscroll, teeth remain a bold option."
    },
    {
      text: "Tomorrow's self has reviewed your leadership and left notes."
    }
  ];

  const latePool = hour >= 22 || hour < 5 ? pool.slice(4) : pool.slice(0, 4);
  const index = Math.abs((now.getMinutes() * 7 + now.getSeconds() * 13 + hour) % latePool.length);
  return latePool[index];
}

function maybeShowReflection(now, estimate) {
  const remainingSeconds = Math.floor(Math.abs(estimate.remainingMs) / 1000);
  const bucket = `${Math.floor(remainingSeconds / 60)}:${now.getMinutes()}`;
  const threshold = remainingSeconds % 60 === 0 || remainingSeconds % 300 === 0;
  const hash = (remainingSeconds + now.getMinutes() * 17 + now.getHours() * 31) % 5;

  if (!threshold || hash !== 0 || lastReflectionBucket === bucket) {
    return;
  }

  lastReflectionBucket = bucket;
  const reflection = reflectionFor(now);
  showToast(reflection);
}

function showToast(reflection) {
  els.toastText.textContent = reflection.text;
  els.toast.hidden = false;
  window.setTimeout(() => {
    els.toast.hidden = true;
  }, 7000);
}

function updateReflection(now) {
  const reflection = reflectionFor(now);
  els.reflectionTexts.forEach((node) => {
    node.textContent = reflection.text;
  });
}

function showContextMenu(event) {
  event.preventDefault();
  const os = event.currentTarget.closest("[data-os]")?.dataset.os || "linux";
  const x = Math.min(event.clientX, window.innerWidth - 250);
  const y = Math.min(event.clientY, window.innerHeight - 250);
  els.contextMenu.dataset.os = os;
  els.contextMenu.style.left = `${Math.max(8, x)}px`;
  els.contextMenu.style.top = `${Math.max(8, y)}px`;
  els.contextMenu.hidden = false;
}

function hideContextMenu() {
  els.contextMenu.hidden = true;
}

function handleMenuButton(button) {
  if (button.dataset.action === "toggle-skin") {
    toggleSkin();
  }
  saveProfile();
  render();
  hideContextMenu();
}

function handleMenuClick(event, button) {
  event.preventDefault();
  event.stopPropagation();
  handleMenuButton(button);
}

function render() {
  const now = new Date();
  const estimate = calculateEstimate(profile, now);
  const payload = buildWaybarPayload(estimate, { skin: profile.skin });
  const progressPercent = Math.round(estimate.progress * 100);
  const timeText = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  els.now.forEach((node) => {
    node.textContent = timeText;
  });
  els.countdown.textContent = estimate.valid ? formatPlainReadout(estimate.remainingMs) : "Enter a birth date";
  els.widgetTexts.forEach((node) => {
    node.textContent = node.dataset.widgetText === "plain" ? payload.text : `MM ${payload.text}`;
  });
  els.widgetShells.forEach((node) => {
    node.classList.remove("calm", "finite", "near", "borrowed");
    node.classList.add(estimate.stateClass);
  });
  els.widgetProgresses.forEach((node) => {
    node.style.width = `${progressPercent}%`;
  });
  els.deathDate.textContent = formatDate(estimate.deathDate);
  els.lifeYears.textContent = `${estimate.lifeExpectancyYears.toFixed(2)} years`;
  els.baseline.textContent = `${estimate.baseline.label}, ${estimate.baseline.year}`;
  els.progressLabels.forEach((node) => {
    node.textContent = `${progressPercent}% elapsed`;
  });
  els.delta.textContent = "updates instantly";
  els.delta.dataset.positive = "true";
  els.disclaimer.textContent =
    "This estimate is a reflection aid. It is not medical, legal, actuarial, insurance, or mental-health advice.";
  updateReflection(now);
  maybeShowReflection(now, estimate);
}

hydrateCountries();
hydrateFields();
setPanelOpen(true);
render();

document.querySelectorAll("input:not([data-factor]), select").forEach((input) => {
  input.addEventListener("input", () => {
    collectFields();
    saveProfile();
    render();
  });
});

document.querySelectorAll("[data-factor]").forEach((input) => {
  input.addEventListener("change", () => {
    setFactor(input);
    saveProfile();
    render();
  });
});

document.querySelectorAll("[data-action='toggle-skin']").forEach((button) => {
  button.addEventListener("click", (event) => handleMenuClick(event, button));
});

els.widgetShells.forEach((widget) => {
  widget.addEventListener("contextmenu", showContextMenu);
});

document.addEventListener("click", (event) => {
  if (!els.contextMenu.contains(event.target)) {
    hideContextMenu();
  }
});

els.panelToggleButton.addEventListener("click", () => {
  setPanelOpen(!panelOpen);
});

els.appPanel.addEventListener("dblclick", (event) => {
  if (!event.target.closest("button, input, select, label")) {
    setPanelOpen(false);
  }
});

els.panelDockWidget.addEventListener("dblclick", () => {
  setPanelOpen(true);
});

window.setInterval(render, 1000);
