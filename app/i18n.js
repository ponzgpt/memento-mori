// Bilingual strings for the web demo. English is the default language (most
// visitors are not Spanish speakers); Spanish is a toggle, not the other way
// around, which is why every EN string here is also what's baked directly
// into app/index.html — the page renders correctly before this file's JS
// even runs, and switching only ever means re-rendering into the other
// language, never "waiting for a translation to arrive."
//
// Keys mirror the shape of native/macos/MementoMoriMenuBar.swift's
// Localizable.strings where the content overlaps (the six lifestyle
// factors), so the same person reading both is reading the same words.

export const LANG_STORAGE_KEY = "memento-mori.lang.v1";
export const DEFAULT_LANG = "en";

export const STRINGS = {
  en: {
    "nav.aria": "Main navigation",
    "nav.calculate": "Calculate",
    "nav.perspective": "Perspective",
    "nav.method": "Method",
    "nav.download": "Download",
    "skip.link": "Skip to the calculator",
    "brand.aria": "Memento Mori, home",

    "hero.eyebrow": "A personal perspective tool",
    "hero.title1": "Remember that you will die.",
    "hero.title2": "Decide how to live today.",
    "hero.lead": "Turn a demographic reference into an understandable picture of your time. Not to guess the ending, but to tell what matters from what merely feels urgent.",
    "hero.cta.primary": "See my horizon",
    "hero.cta.secondary": "Take it to my menu bar",
    "hero.privacy": "No account, no ads, and nothing sent.",

    "widgetPreview.aria": "Preview: the same widget computing an example countdown in the macOS menu bar, Windows tray, and Linux Waybar.",
    "widgetPreview.waybarLabel": "Linux · Waybar",
    "widgetPreview.caption": "Illustrative preview: the same calculation, updating live, with an example profile — not a capture of any operating system.",

    "quote.text": "“It is not that we have a short time to live, but that we waste a lot of it.”",
    "quote.author": "Seneca",

    "calc.eyebrow": "01 · Place the horizon",
    "calc.title": "Your context. One perspective.",
    "calc.lead": "We use a broad population reference. The result is deliberately approximate and shown as a range, not a prediction.",

    "form.kicker": "Your context",
    "form.heading": "Get started",
    "form.birthDate.label": "Date of birth",
    "form.birthDate.help": "Used only to place the time you've lived.",
    "form.birthCountry.label": "Country of birth",
    "form.birthCountry.help": "Population life-expectancy reference published by World Bank WDI.",
    "form.movedCountry.label": "I've lived in more than one country",
    "form.currentCountry.label": "Current country of residence",
    "form.currentCountry.help": "The reference blends gradually toward this country from the age you moved.",
    "form.moveAge.label": "Since what age",
    "form.moveAge.help": "The age you started living in your current country of residence.",
    "form.lifestyle.legend": "Lifestyle",
    "form.lifestyle.help": "The same six factors the desktop widget uses, with the same values.",
    "form.sex.label": "Sex",
    "sex.male": "Male",
    "sex.female": "Female",
    "form.sleep.label": "Sleep",
    "sleep.stable": "Stable",
    "sleep.irregular": "Irregular",
    "form.exercise.label": "Exercise",
    "exercise.sedentary": "Sedentary",
    "exercise.light": "Light",
    "exercise.moderate": "Moderate",
    "exercise.regular": "Regular",
    "exercise.athletic": "Athletic",
    "form.drinking.label": "Drinking",
    "drinking.none": "None",
    "drinking.light": "Light",
    "drinking.moderate": "Moderate",
    "drinking.frequent": "Frequent",
    "drinking.heavy": "Heavy",
    "form.smoking.label": "Smoking",
    "smoking.never": "Never",
    "smoking.former": "Former",
    "smoking.occasional": "Occasional",
    "smoking.regular": "Regular",
    "smoking.heavy": "Heavy",
    "form.health.label": "Health",
    "health.none": "OK",
    "health.managed": "Managed",
    "health.serious": "Serious",
    "form.submit": "Calculate my perspective",
    "form.reset": "Delete my data",
    "form.localBadge": "This device only",

    "result.empty.title": "Your horizon will appear here",
    "result.empty.body": "Then you'll see it as a date, years, weeks, and a whole life in perspective.",
    "result.kicker": "Approximate central horizon",
    "result.copy.aria": "Copy my perspective summary",
    "result.copy.label": "Copy",
    "result.range.prefix": "Perspective range:",
    "result.explainer": "This is not a predicted death date. It's the center of a population reference with a broad ±7-year margin.",
    "result.stats.aria": "Approximate time remaining",
    "result.stats.years": "years",
    "result.stats.weeks": "weeks",
    "result.stats.days": "days",
    "result.timeLived.kicker": "Time lived",
    "result.timeLived.suffix": "of this central reference.",

    "perspective.eyebrow": "02 · Make it visible",
    "perspective.title": "One life, year by year.",
    "perspective.lead": "Each cell is one year. The light ones have passed; the gold ones make up the central horizon; the outline is a reminder that every estimate carries uncertainty.",
    "perspective.legend.lived": "Lived",
    "perspective.legend.remaining": "Horizon",
    "perspective.legend.range": "Margin",
    "perspective.gridAria": "A picture of years lived and years remaining",
    "perspective.card1.kicker": "If you set aside one afternoon a week",
    "perspective.card1.suffix": "mindful afternoons would still fit in this reference.",
    "perspective.card2.kicker": "If you saw someone once a month",
    "perspective.card2.suffix": "get-togethers would still fit. Frequency is a choice too.",
    "perspective.card3.kicker": "Today",
    "perspective.card3.value": "1",
    "perspective.card3.suffix": "is the one unit you can actually direct right now.",

    "intention.eyebrow": "03 · Come back to today",
    "intention.title": "What deserves an hour of your attention?",
    "intention.lead": "Perspective is only useful if it changes one small decision. Write one concrete intention for today; it will stay saved only on this device.",
    "intention.label": "Today I want to spend time on…",
    "intention.placeholder": "Call…, finish…, walk…, be with…",
    "intention.save": "Save intention",
    "intention.delete": "Delete",

    "method.eyebrow": "Method and limits",
    "method.title": "Useful because it's honest.",
    "method.lead": "An exact figure would be false precision. That's why we show the method, a wide range, and the limits, right inside the product.",
    "method.card1.title": "Public reference",
    "method.card1.body": 'We use life expectancy at birth from the <a href="https://data.worldbank.org/indicator/SP.DYN.LE00.IN" rel="noreferrer">World Bank WDI indicator SP.DYN.LE00.IN</a>, 2024 values.',
    "method.card2.title": "Transparent calculation",
    "method.card2.body": "Birth date + country reference + six lifestyle factors = central horizon. We add ±7 years to avoid presenting a certainty that doesn't exist.",
    "method.card3.title": "Local privacy",
    "method.card3.body": "The calculation happens in your browser. No account, no database, no analytics, and no profile sent to a server.",
    "method.card4.title": "Not professional advice",
    "method.card4.body": "This is not an individual prediction, and not medical, actuarial, insurance, legal, or mental-health advice.",

    "download.eyebrow": "04 · Take it with you",
    "download.title": "This page is the demo. The widget is the product.",
    "download.lead": "Here you try the same model with your own data. Installed, it lives in your menu bar or Waybar and keeps counting in the background without needing this tab open.",
    "download.macos.title": "Menu bar",
    "download.macos.body": "Source install, not yet signed or notarized.",
    "download.windows.title": "System tray",
    "download.windows.body": "Start Menu shortcut, installed with PowerShell.",
    "download.linux.title": "Waybar module",
    "download.linux.body": "Python script and example styling for your bar.",
    "download.instructions": "See instructions",
    "download.source": "Source on GitHub",

    "closing.eyebrow": "Memento mori · Remember you will die",
    "closing.title1": "Not to live in fear.",
    "closing.title2": "To live with measure.",
    "closing.cta": "Review my perspective",

    "footer.tagline": "A reflective, private reference. It does not predict an individual death.",
    "footer.link": "Data, method, and limits",

    "lang.toggleAria": "Language",

    "js.storageStatus.local": "This device only",
    "js.storageStatus.unavailable": "Persistence unavailable",
    "js.toast.storageUnavailable": "The calculation still works, but this browser won't let it save your data.",
    "js.toast.calculated": "Perspective calculated and saved on this device.",
    "js.toast.dataDeleted": "Local data deleted.",
    "js.toast.intentionRequired": "Write a concrete intention before saving it.",
    "js.toast.intentionSaved": "Intention saved on this device.",
    "js.toast.intentionDeleted": "Intention deleted.",
    "js.toast.copied": "Summary copied without your birth date.",
    "js.toast.copyFailed": "Couldn't access the clipboard. You can copy the date shown.",
    "js.resetConfirm": "Delete your saved date, country, and intention on this device?",
    "js.intention.markPending": "Mark intention as pending",
    "js.intention.markComplete": "Mark intention as complete",
    "js.copySummary.title": "My time in perspective · Memento Mori",
    "js.copySummary.horizon": "Central population horizon:",
    "js.copySummary.range": "Wide range:",
    "js.copySummary.disclaimer": "Not an individual prediction. memento.technoir.cloud",
    "js.gridAria": "{lived} years lived and a central horizon of {central} years, with a seven-year margin.",
    "js.gridCaption": "You've lived roughly {lived} years. The central horizon runs to {central}; the outline extends the margin to {range}.",
    "js.liveReadout": "Reference updated on {date}.",

    "validation.required": "Enter a valid date of birth.",
    "validation.future": "Date of birth can't be in the future.",
    "validation.tooOld": "Enter a date within the last 120 years.",

    "countries.yearsUnit": "years",

    "meta.title": "Memento Mori · Your time in perspective",
    "meta.description": "Put your time in perspective with a private population reference and one concrete intention for today."
  },

  es: {
    "nav.aria": "Navegación principal",
    "nav.calculate": "Calcular",
    "nav.perspective": "Perspectiva",
    "nav.method": "Método",
    "nav.download": "Descargar",
    "skip.link": "Saltar a la calculadora",
    "brand.aria": "Memento Mori, inicio",

    "hero.eyebrow": "Una herramienta de perspectiva personal",
    "hero.title1": "Recuerda que vas a morir.",
    "hero.title2": "Decide cómo vivir hoy.",
    "hero.lead": "Convierte una referencia demográfica en una imagen comprensible de tu tiempo. No para adivinar el final, sino para distinguir lo importante de lo urgente.",
    "hero.cta.primary": "Ver mi horizonte",
    "hero.cta.secondary": "Llevarlo a mi barra de menús",
    "hero.privacy": "Sin cuenta, sin anuncios y sin enviar tus datos.",

    "widgetPreview.aria": "Vista previa: el mismo widget calculando una cuenta atrás de ejemplo en la barra de macOS, la bandeja de Windows y Waybar de Linux.",
    "widgetPreview.waybarLabel": "Linux · Waybar",
    "widgetPreview.caption": "Vista previa ilustrativa: el mismo cálculo, actualizándose en vivo, con un perfil de ejemplo — no es una captura de cada sistema operativo.",

    "quote.text": "“No es que tengamos poco tiempo, sino que perdemos mucho.”",
    "quote.author": "Séneca",

    "calc.eyebrow": "01 · Sitúa el horizonte",
    "calc.title": "Tu contexto. Una perspectiva.",
    "calc.lead": "Usamos una referencia poblacional amplia. El resultado es deliberadamente aproximado y se presenta con un rango, no como una predicción individual.",

    "form.kicker": "Tu contexto",
    "form.heading": "Empezar",
    "form.birthDate.label": "Fecha de nacimiento",
    "form.birthDate.help": "Se utiliza únicamente para situar el tiempo vivido.",
    "form.birthCountry.label": "País de nacimiento",
    "form.birthCountry.help": "Referencia de esperanza de vida poblacional publicada por World Bank WDI.",
    "form.movedCountry.label": "He vivido en más de un país",
    "form.currentCountry.label": "País de residencia actual",
    "form.currentCountry.help": "La referencia se mezcla gradualmente hacia este país a partir de la edad de mudanza.",
    "form.moveAge.label": "Desde qué edad",
    "form.moveAge.help": "Edad a la que empezaste a vivir en el país de residencia actual.",
    "form.lifestyle.legend": "Estilo de vida",
    "form.lifestyle.help": "Los mismos seis factores que usa el widget de escritorio, con los mismos valores.",
    "form.sex.label": "Sexo",
    "sex.male": "Hombre",
    "sex.female": "Mujer",
    "form.sleep.label": "Sueño",
    "sleep.stable": "Estable",
    "sleep.irregular": "Irregular",
    "form.exercise.label": "Ejercicio",
    "exercise.sedentary": "Sedentario",
    "exercise.light": "Ligero",
    "exercise.moderate": "Moderado",
    "exercise.regular": "Regular",
    "exercise.athletic": "Atlético",
    "form.drinking.label": "Alcohol",
    "drinking.none": "Nada",
    "drinking.light": "Ligero",
    "drinking.moderate": "Moderado",
    "drinking.frequent": "Frecuente",
    "drinking.heavy": "Alto",
    "form.smoking.label": "Tabaco",
    "smoking.never": "Nunca",
    "smoking.former": "Ex-fumador",
    "smoking.occasional": "Ocasional",
    "smoking.regular": "Habitual",
    "smoking.heavy": "Intensivo",
    "form.health.label": "Salud",
    "health.none": "Bien",
    "health.managed": "Controlada",
    "health.serious": "Grave",
    "form.submit": "Calcular mi perspectiva",
    "form.reset": "Borrar mis datos",
    "form.localBadge": "Solo en este dispositivo",

    "result.empty.title": "Tu horizonte aparecerá aquí",
    "result.empty.body": "Después podrás verlo como fecha, años, semanas y una vida completa en perspectiva.",
    "result.kicker": "Horizonte central aproximado",
    "result.copy.aria": "Copiar resumen de mi perspectiva",
    "result.copy.label": "Copiar",
    "result.range.prefix": "Rango de perspectiva:",
    "result.explainer": "No es una fecha de muerte predicha. Es el centro de una referencia poblacional con un margen amplio de ±7 años.",
    "result.stats.aria": "Tiempo restante aproximado",
    "result.stats.years": "años",
    "result.stats.weeks": "semanas",
    "result.stats.days": "días",
    "result.timeLived.kicker": "Tiempo vivido",
    "result.timeLived.suffix": "de esta referencia central.",

    "perspective.eyebrow": "02 · Hazlo visible",
    "perspective.title": "Una vida, año a año.",
    "perspective.lead": "Cada celda representa un año. Las claras ya han pasado; las doradas forman el horizonte central; el contorno recuerda que todo cálculo tiene incertidumbre.",
    "perspective.legend.lived": "Vivido",
    "perspective.legend.remaining": "Horizonte",
    "perspective.legend.range": "Margen",
    "perspective.gridAria": "Representación de años vividos y horizonte restante",
    "perspective.card1.kicker": "Si apartaras una tarde cada semana",
    "perspective.card1.suffix": "tardes conscientes quedarían en esta referencia.",
    "perspective.card2.kicker": "Si vieras a alguien una vez al mes",
    "perspective.card2.suffix": "encuentros cabrían todavía. La frecuencia también es una decisión.",
    "perspective.card3.kicker": "El día de hoy",
    "perspective.card3.value": "1",
    "perspective.card3.suffix": "es la unidad que sí puedes dirigir ahora mismo.",

    "intention.eyebrow": "03 · Vuelve a hoy",
    "intention.title": "¿Qué merece una hora de tu atención?",
    "intention.lead": "La perspectiva solo sirve si cambia una decisión pequeña. Escribe una intención concreta para hoy; quedará guardada únicamente en este dispositivo.",
    "intention.label": "Hoy quiero dedicar tiempo a…",
    "intention.placeholder": "Llamar a…, terminar…, caminar…, estar con…",
    "intention.save": "Guardar intención",
    "intention.delete": "Eliminar",

    "method.eyebrow": "Método y límites",
    "method.title": "Útil porque es honesto.",
    "method.lead": "Una cifra exacta sería falsa precisión. Por eso mostramos el método, un rango amplio y los límites dentro del propio producto.",
    "method.card1.title": "Referencia pública",
    "method.card1.body": 'Usamos esperanza de vida al nacer del indicador <a href="https://data.worldbank.org/indicator/SP.DYN.LE00.IN" rel="noreferrer">SP.DYN.LE00.IN de World Bank WDI</a>, con valores 2024.',
    "method.card2.title": "Cálculo transparente",
    "method.card2.body": "Fecha de nacimiento + referencia del país + seis factores de estilo de vida = horizonte central. Añadimos ±7 años para evitar presentar una certeza inexistente.",
    "method.card3.title": "Privacidad local",
    "method.card3.body": "El cálculo sucede en tu navegador. No hay cuenta, base de datos, analítica ni envío del perfil a un servidor.",
    "method.card4.title": "No es consejo profesional",
    "method.card4.body": "No es una predicción individual ni consejo médico, actuarial, de seguros, legal o de salud mental.",

    "download.eyebrow": "04 · Llévalo contigo",
    "download.title": "Esta página es la demo. El widget es el producto.",
    "download.lead": "Aquí pruebas el mismo modelo con tus propios datos. Instalado, vive en tu barra de menús o Waybar y cuenta en segundo plano sin depender de tener esta pestaña abierta.",
    "download.macos.title": "Barra de menús",
    "download.macos.body": "Instalación desde el código fuente, sin firma ni notarización todavía.",
    "download.windows.title": "Bandeja del sistema",
    "download.windows.body": "Acceso directo en el menú de inicio, instalado con PowerShell.",
    "download.linux.title": "Módulo Waybar",
    "download.linux.body": "Script Python y estilo de ejemplo para tu barra.",
    "download.instructions": "Ver instrucciones",
    "download.source": "Código fuente en GitHub",

    "closing.eyebrow": "Memento mori · Recuerda que morirás",
    "closing.title1": "No para vivir con miedo.",
    "closing.title2": "Para vivir con medida.",
    "closing.cta": "Revisar mi perspectiva",

    "footer.tagline": "Referencia reflexiva y privada. No predice una muerte individual.",
    "footer.link": "Datos, método y límites",

    "lang.toggleAria": "Idioma",

    "js.storageStatus.local": "Solo en este dispositivo",
    "js.storageStatus.unavailable": "Persistencia no disponible",
    "js.toast.storageUnavailable": "El cálculo funciona, pero este navegador no permite guardar los datos.",
    "js.toast.calculated": "Perspectiva calculada y guardada en este dispositivo.",
    "js.toast.dataDeleted": "Datos locales eliminados.",
    "js.toast.intentionRequired": "Escribe una intención concreta antes de guardarla.",
    "js.toast.intentionSaved": "Intención guardada en este dispositivo.",
    "js.toast.intentionDeleted": "Intención eliminada.",
    "js.toast.copied": "Resumen copiado sin incluir tu fecha de nacimiento.",
    "js.toast.copyFailed": "No se pudo acceder al portapapeles. Puedes copiar la fecha visible.",
    "js.resetConfirm": "¿Borrar tu fecha, país e intención guardados en este dispositivo?",
    "js.intention.markPending": "Marcar intención como pendiente",
    "js.intention.markComplete": "Marcar intención como completada",
    "js.copySummary.title": "Mi tiempo en perspectiva · Memento Mori",
    "js.copySummary.horizon": "Horizonte poblacional central:",
    "js.copySummary.range": "Rango amplio:",
    "js.copySummary.disclaimer": "No es una predicción individual. memento.technoir.cloud",
    "js.gridAria": "{lived} años vividos y un horizonte central de {central} años, con margen de siete años.",
    "js.gridCaption": "Has vivido aproximadamente {lived} años. El horizonte central ocupa hasta los {central}; el contorno prolonga el margen hasta los {range}.",
    "js.liveReadout": "Referencia actualizada el {date}.",

    "validation.required": "Introduce una fecha de nacimiento válida.",
    "validation.future": "La fecha de nacimiento no puede estar en el futuro.",
    "validation.tooOld": "Introduce una fecha dentro de los últimos 120 años.",

    "countries.yearsUnit": "años",

    "meta.title": "Memento Mori · Tu tiempo en perspectiva",
    "meta.description": "Pon tu tiempo en perspectiva con una referencia poblacional privada y una intención concreta para hoy."
  }
};

// Country names are not duplicated here: BASELINES[code].label in
// memento-core.js already is the English name (it doubles as the lookup
// key), so English needs no separate list. Spanish is the only translation
// required.
export const COUNTRY_LABELS_ES = {
  WLD: "Promedio mundial",
  USA: "Estados Unidos",
  GBR: "Reino Unido",
  DEU: "Alemania",
  ESP: "España",
  JPN: "Japón",
  IND: "India",
  BRA: "Brasil"
};

export function getLang() {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    return stored === "es" || stored === "en" ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function setLang(lang) {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Sin persistencia el toggle sigue funcionando para la sesión actual.
  }
}

export function t(key, lang) {
  const table = STRINGS[lang] || STRINGS[DEFAULT_LANG];
  return table[key] ?? STRINGS[DEFAULT_LANG][key] ?? key;
}

export function countryLabel(code, baseline, lang) {
  if (lang === "es") {
    return COUNTRY_LABELS_ES[code] || baseline.label;
  }
  return baseline.label;
}
