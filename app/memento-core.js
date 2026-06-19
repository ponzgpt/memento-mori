export const SECONDS_PER_YEAR = 365.2425 * 24 * 60 * 60;
export const MILLIS_PER_YEAR = SECONDS_PER_YEAR * 1000;

export const BASELINES = {
  WLD: { label: "World average", years: 73.480380292779, year: 2024 },
  USA: { label: "United States", years: 78.890243902439, year: 2024 },
  GBR: { label: "United Kingdom", years: 81.3868536585366, year: 2024 },
  DEU: { label: "Germany", years: 80.7926829268293, year: 2024 },
  ESP: { label: "Spain", years: 83.8878048780488, year: 2024 },
  JPN: { label: "Japan", years: 84.0363414634146, year: 2024 },
  IND: { label: "India", years: 72.235, year: 2024 },
  BRA: { label: "Brazil", years: 76.023, year: 2024 }
};

export const SOURCE_NOTE =
  "World Bank WDI SP.DYN.LE00.IN, 2024 values, API last updated 2026-04-08. This is a population-period statistic, not an individual prediction.";

export const DEFAULT_PROFILE = {
  birthDate: "1992-06-19",
  country: "WLD",
  birthCountry: "WLD",
  currentCountry: "WLD",
  moveAge: 0,
  skin: "system-light",
  sex: "skip",
  sleep: "skip",
  exercise: "skip",
  drinking: "skip",
  smoking: "skip",
  health: "skip"
};

export const FACTOR_KEYS = ["sex", "sleep", "exercise", "drinking", "smoking", "health"];

export const CUSTOM_OFFSETS = {
  sex: {
    female: { years: 3.1, label: "Female life tables tend to run higher" },
    male: { years: -2.4, label: "Male life tables tend to run lower" },
    skip: { years: 0, label: "Skipped" }
  },
  sleep: {
    stable: { years: 1, label: "Stable sleep adjustment" },
    irregular: { years: -1.2, label: "Irregular sleep adjustment" },
    skip: { years: 0, label: "Skipped" }
  },
  exercise: {
    regular: { years: 2, label: "Regular exercise adjustment" },
    low: { years: -2, label: "Low exercise adjustment" },
    skip: { years: 0, label: "Skipped" }
  },
  drinking: {
    low: { years: 0.4, label: "Low alcohol adjustment" },
    high: { years: -2.2, label: "High alcohol adjustment" },
    skip: { years: 0, label: "Skipped" }
  },
  smoking: {
    none: { years: 1.2, label: "No smoking adjustment" },
    former: { years: 0.4, label: "Former smoker adjustment" },
    current: { years: -4.5, label: "Current smoking risk adjustment" },
    skip: { years: 0, label: "Skipped" }
  },
  health: {
    none: { years: 1, label: "No known managed condition adjustment" },
    managed: { years: -1, label: "Managed condition adjustment" },
    serious: { years: -4, label: "Serious condition adjustment" },
    skip: { years: 0, label: "Skipped" }
  }
};

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function parseBirthDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function yearsBetween(start, end) {
  return (end.getTime() - start.getTime()) / MILLIS_PER_YEAR;
}

export function addYears(date, years) {
  return new Date(date.getTime() + years * MILLIS_PER_YEAR);
}

export function getBaseline(countryCode) {
  return BASELINES[countryCode] || BASELINES.WLD;
}

export function buildResidenceBaseline(profile, ageYears = 0) {
  const origin = getBaseline(profile.birthCountry || profile.country);
  const residence = getBaseline(profile.currentCountry || profile.birthCountry || profile.country);
  const moveAge = Number.parseFloat(profile.moveAge);

  if (origin === residence || !Number.isFinite(moveAge) || moveAge <= 0 || moveAge >= ageYears) {
    return {
      ...origin,
      origin,
      residence,
      migrationWeight: 0
    };
  }

  const yearsSinceMove = Math.max(0, ageYears - moveAge);
  const migrationWeight = clamp(yearsSinceMove / 20, 0, 0.65);
  const years = origin.years + (residence.years - origin.years) * migrationWeight;

  return {
    label: `${origin.label} -> ${residence.label}`,
    years,
    year: Math.max(origin.year, residence.year),
    origin,
    residence,
    migrationWeight
  };
}

export function calculateCustomOffset(profile) {
  const details = FACTOR_KEYS.map((key) => {
    const value = profile[key] || "skip";
    const entry = CUSTOM_OFFSETS[key][value] || CUSTOM_OFFSETS[key].skip;
    return { key, value, years: entry.years, label: entry.label };
  });

  const inferred = details.reduce((sum, item) => sum + item.years, 0);

  return {
    years: inferred,
    inferred,
    manual: 0,
    details
  };
}

export function calculateEstimate(profile, now = new Date()) {
  const birth = parseBirthDate(profile.birthDate);
  const ageYears = birth ? Math.max(0, yearsBetween(birth, now)) : 0;
  const baseline = buildResidenceBaseline(profile, ageYears);
  const customOffset = calculateCustomOffset(profile);

  const lifeExpectancyYears = clamp(baseline.years + customOffset.years, 45, 105);
  const deathDate = birth ? addYears(birth, lifeExpectancyYears) : null;
  const remainingMs = deathDate ? deathDate.getTime() - now.getTime() : 0;
  const progress = lifeExpectancyYears > 0 ? clamp(ageYears / lifeExpectancyYears, 0, 1) : 0;

  return {
    valid: Boolean(birth),
    birth,
    baseline,
    sourceNote: SOURCE_NOTE,
    customOffset,
    lifeExpectancyYears,
    deathDate,
    ageYears,
    remainingMs,
    progress,
    stateClass: classifyRemaining(progress, remainingMs)
  };
}

export function classifyRemaining(progress, remainingMs) {
  if (remainingMs < 0) {
    return "borrowed";
  }
  if (progress >= 0.88) {
    return "near";
  }
  if (progress >= 0.66) {
    return "finite";
  }
  return "calm";
}

export function splitDuration(ms) {
  let seconds = Math.floor(Math.abs(ms) / 1000);
  const years = Math.floor(seconds / SECONDS_PER_YEAR);
  seconds -= Math.floor(years * SECONDS_PER_YEAR);
  const days = Math.floor(seconds / 86400);
  seconds -= days * 86400;
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  return { years, days, hours, minutes, seconds };
}

export function formatDuration(ms, mode = "compact") {
  const parts = splitDuration(ms);
  const prefix = ms < 0 ? "+" : "";

  if (mode === "seconds") {
    return `${prefix}${Math.floor(Math.abs(ms) / 1000).toLocaleString()}s`;
  }

  if (mode === "full") {
    return `${prefix}${parts.years}y ${parts.days}d ${parts.hours}h ${parts.minutes}m ${parts.seconds}s`;
  }

  return `${prefix}${parts.years}y ${parts.days}d ${parts.hours}h`;
}

export function formatDate(date) {
  if (!date) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(date);
}

export function buildWaybarPayload(estimate, options = {}) {
  const skin = options.skin || "system-light";
  const text = estimate.valid ? formatDuration(estimate.remainingMs, "full") : "setup needed";
  const tooltip = estimate.valid
    ? [
        `Memento Mori: ${formatDuration(estimate.remainingMs, "full")} remaining`,
        `Death date: ${formatDate(estimate.deathDate)}`,
        `Model: ${estimate.baseline.label} ${estimate.baseline.year}`,
        "Approximation only. Not medical, legal, or actuarial advice."
      ].join("\n")
    : "Open setup and enter a birth date.";

  return {
    text,
    tooltip,
    class: ["memento-mori", `skin-${skin}`, estimate.stateClass],
    percentage: Math.round(estimate.progress * 100)
  };
}

export function serializeProfileConfig(profile, estimate = calculateEstimate(profile)) {
  return {
    schema: "memento-mori.profile.v1",
    birth_date: profile.birthDate,
    birth_country: profile.birthCountry || profile.country,
    current_country: profile.currentCountry || profile.birthCountry || profile.country,
    move_age: Number.parseFloat(profile.moveAge) || 0,
    country: profile.country,
    life_expectancy_years: Number(estimate.lifeExpectancyYears.toFixed(4)),
    skin: profile.skin || "system-light",
    disclaimer: "Approximation only. Not medical, legal, actuarial, or insurance advice.",
    source: estimate.sourceNote,
    custom_offsets: estimate.customOffset.details
  };
}
