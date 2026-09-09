import AppKit
import Foundation

private let secondsPerYear = 365.2425 * 24.0 * 60.0 * 60.0

/// Localiza una cadena de la interfaz. Usa el mecanismo estándar de Apple:
/// Contents/Resources/en.lproj/Localizable.strings y es.lproj/Localizable.strings
/// dentro del .app bundle (los copia installers/macos/install.sh), así que el
/// sistema elige el idioma según la preferencia del usuario sin más código.
private func L(_ key: String) -> String {
    NSLocalizedString(key, bundle: .main, comment: "")
}

private struct Baseline {
    /// Nombre en inglés, usado también como clave de localización.
    let label: String
    let years: Double
}

private let baselines: [String: Baseline] = [
    "WLD": Baseline(label: "World average", years: 73.480380292779),
    "USA": Baseline(label: "United States", years: 78.890243902439),
    "GBR": Baseline(label: "United Kingdom", years: 81.3868536585366),
    "DEU": Baseline(label: "Germany", years: 80.7926829268293),
    "ESP": Baseline(label: "Spain", years: 83.8878048780488),
    "JPN": Baseline(label: "Japan", years: 84.0363414634146),
    "IND": Baseline(label: "India", years: 72.235),
    "BRA": Baseline(label: "Brazil", years: 76.023)
]

private let countryOrder = ["WLD", "USA", "GBR", "DEU", "ESP", "JPN", "IND", "BRA"]

private func baseline(for code: String) -> Baseline {
    baselines[code] ?? baselines["WLD"]!
}

private func countryName(_ code: String) -> String {
    L(baseline(for: code).label)
}

private struct FactorOption {
    let value: String
    let years: Double
}

// Sin opción de "saltar": cada factor pide una respuesta real. El orden de
// cada lista es el orden en que se ve en su control — para los sliders es
// además el propio espectro (sedentario -> atlético), así que no se puede
// reordenar solo por conveniencia del valor por defecto; el valor por
// defecto de cada factor vive aparte, en defaultFactors. Las etiquetas no se
// guardan aquí: se localizan bajo la clave "<factor>.<value>" (optionLabel).
// Sexo/sueño/salud son categorías sin orden natural (segmented control);
// ejercicio/alcohol/tabaco sí son un espectro, por eso son sliders.
private let factorOptions: [String: [FactorOption]] = [
    "sex": [
        FactorOption(value: "male", years: -2.4),
        FactorOption(value: "female", years: 3.1)
    ],
    "sleep": [
        FactorOption(value: "stable", years: 1),
        FactorOption(value: "irregular", years: -1.2)
    ],
    "exercise": [
        FactorOption(value: "sedentary", years: -2.5),
        FactorOption(value: "light", years: -0.6),
        FactorOption(value: "moderate", years: 0.8),
        FactorOption(value: "regular", years: 2.0),
        FactorOption(value: "athletic", years: 3.4)
    ],
    "drinking": [
        FactorOption(value: "none", years: 0.6),
        FactorOption(value: "light", years: 0.3),
        FactorOption(value: "moderate", years: -0.9),
        FactorOption(value: "frequent", years: -2.1),
        FactorOption(value: "heavy", years: -3.8)
    ],
    "smoking": [
        FactorOption(value: "never", years: 1.2),
        FactorOption(value: "former", years: 0.4),
        FactorOption(value: "occasional", years: -1.6),
        FactorOption(value: "regular", years: -3.3),
        FactorOption(value: "heavy", years: -5.6)
    ],
    "health": [
        FactorOption(value: "none", years: 1),
        FactorOption(value: "managed", years: -1),
        FactorOption(value: "serious", years: -4)
    ]
]

private func optionLabel(_ factorKey: String, _ value: String) -> String {
    L("\(factorKey).\(value)")
}

// Punto de partida en la primera instalación y al pulsar "Reset defaults":
// el más frecuente/típico de cada escala, no necesariamente el mejor.
private let defaultFactors: [String: String] = [
    "sex": "male", "sleep": "stable", "exercise": "moderate",
    "drinking": "light", "smoking": "never", "health": "none"
]

// Filas con segmented control (categorías sin orden) frente a filas con
// slider (espectro). El orden aquí es el orden en que aparecen en el menú.
// La segunda posición de cada tupla es la clave de localización de la etiqueta.
private let segmentedFactors: [(key: String, labelKey: String)] = [
    ("sex", "Sex"), ("sleep", "Sleep"), ("health", "Health")
]
private let sliderFactors: [(key: String, labelKey: String)] = [
    ("exercise", "Exercise"), ("drinking", "Drinking"), ("smoking", "Smoking")
]

private struct Profile {
    var birthDate: Date
    var birthCountry: String
    var currentCountry: String
    var moveAge: Double
    var factors: [String: String]
    // Qué se enseña en la barra de menús. Los años no se pueden apagar: son
    // el suelo del contador, y una cuenta atrás que no cuenta nada no es una
    // cuenta atrás. Todo lo demás es elección de cada uno, entre ocupar tres
    // caracteres u ocupar media barra.
    var showDays: Bool
    var showHours: Bool
    var showMinutes: Bool
    var showSeconds: Bool
    var showPercent: Bool
    var showDeathDate: Bool
}

private struct Estimate {
    let remaining: TimeInterval
    let deathDate: Date
    let lifeExpectancy: Double
    let progress: Double
}

private func clamp(_ value: Double, _ minValue: Double, _ maxValue: Double) -> Double {
    min(max(value, minValue), maxValue)
}

private func defaultBirthDate() -> Date {
    var components = DateComponents()
    components.calendar = Calendar(identifier: .gregorian)
    components.timeZone = TimeZone(secondsFromGMT: 0)
    components.year = 1992
    components.month = 6
    components.day = 19
    return components.date ?? Date()
}

private func yearsBetween(_ start: Date, _ end: Date) -> Double {
    end.timeIntervalSince(start) / secondsPerYear
}

private func addYears(_ years: Double, to date: Date) -> Date {
    date.addingTimeInterval(years * secondsPerYear)
}

/// Calendario en UTC: la fecha de nacimiento se guarda como instante absoluto,
/// así que hay que leer/escribir sus componentes en la misma zona horaria con
/// la que se construyó (ver defaultBirthDate), o el día se corre al cambiar
/// de huso horario.
private func utcCalendar() -> Calendar {
    var cal = Calendar(identifier: .gregorian)
    cal.timeZone = TimeZone(secondsFromGMT: 0)!
    return cal
}

/// Cuenta atrás con granularidad configurable. Los años son la base fija; días,
/// horas, minutos y segundos son independientes entre sí porque en el menú cada
/// uno tiene su propio interruptor. El sufijo de año se localiza (y/a); el
/// resto -d/h/m/s- coincide en inglés y en español, así que se deja literal.
///
/// El porcentaje y la fecha de muerte no salen de aquí: son piezas aparte que
/// compone quien pinta la barra, porque cada una tiene su propio interruptor.
private func formatCountdown(_ secondsValue: TimeInterval, showDays: Bool, showHours: Bool,
                             showMinutes: Bool, showSeconds: Bool) -> String {
    var seconds = Int(abs(secondsValue))
    let years = Int(Double(seconds) / secondsPerYear)
    seconds -= Int(Double(years) * secondsPerYear)
    let days = seconds / 86_400
    seconds -= days * 86_400
    let hours = seconds / 3_600
    seconds -= hours * 3_600
    let minutes = seconds / 60
    seconds -= minutes * 60
    let secs = seconds

    var parts = ["\(years)\(L("unit.year"))"]
    if showDays { parts.append("\(days)d") }
    if showHours { parts.append("\(hours)h") }
    if showMinutes { parts.append("\(minutes)m") }
    if showSeconds { parts.append(String(format: "%02ds", secs)) }
    let prefix = secondsValue < 0 ? "+" : ""
    return prefix + parts.joined(separator: " ")
}

/// Calavera mínima, dibujada como imagen template para que la barra la tiña
/// sola en claro y en oscuro. No es skull-and-crossbones: docs/apple-platform-plan.md
/// pide un emblema sobrio, así que solo hay cráneo, cuencas y mandíbula.
///
/// Esta geometría es la fuente canónica del emblema del proyecto: el mismo
/// trazado (proporciones relativas al width/height) se reproduce en
/// assets/skull.svg para generar el .ico de Windows y cualquier otro export,
/// de modo que las tres plataformas compartan el mismo dibujo hasta donde su
/// superficie lo permite.
private func skullImage(height: CGFloat = 15) -> NSImage {
    let width = height * 0.80
    let image = NSImage(size: NSSize(width: width, height: height), flipped: false) { _ in
        NSColor.black.setFill()

        let cranium = NSBezierPath(roundedRect: NSRect(x: 0, y: height * 0.28,
                                                       width: width, height: height * 0.72),
                                   xRadius: width * 0.46, yRadius: height * 0.36)
        cranium.fill()

        let jaw = NSBezierPath(roundedRect: NSRect(x: width * 0.22, y: height * 0.02,
                                                   width: width * 0.56, height: height * 0.34),
                               xRadius: width * 0.14, yRadius: height * 0.10)
        jaw.fill()

        // Las cuencas y la nariz se perforan en negativo: así el glifo sigue
        // siendo una sola silueta y no depende del color de fondo.
        NSGraphicsContext.current?.compositingOperation = .destinationOut
        NSColor.black.setFill()

        let socket = width * 0.30
        let socketY = height * 0.50
        NSBezierPath(ovalIn: NSRect(x: width * 0.11, y: socketY,
                                    width: socket, height: socket)).fill()
        NSBezierPath(ovalIn: NSRect(x: width - width * 0.11 - socket, y: socketY,
                                    width: socket, height: socket)).fill()

        let nose = NSBezierPath()
        nose.move(to: NSPoint(x: width * 0.50, y: height * 0.50))
        nose.line(to: NSPoint(x: width * 0.38, y: height * 0.34))
        nose.line(to: NSPoint(x: width * 0.62, y: height * 0.34))
        nose.close()
        nose.fill()

        // Una sola muesca central para la dentadura: a 15 pt dos muescas caen
        // por debajo del píxel y se empastan en una mancha gris.
        NSBezierPath(rect: NSRect(x: width * 0.47, y: 0, width: width * 0.08,
                                  height: height * 0.22)).fill()
        return true
    }
    image.isTemplate = true
    return image
}

private func reflectionText(now: Date) -> String {
    let calendar = Calendar.current
    let hour = calendar.component(.hour, from: now)
    let minute = calendar.component(.minute, from: now)
    let second = calendar.component(.second, from: now)
    let regularCount = 4
    let lateCount = 2
    let isLate = hour >= 22 || hour < 5
    let pool = isLate ? "late" : "regular"
    let count = isLate ? lateCount : regularCount
    let index = abs((minute * 7 + second * 13 + hour) % count)
    return L("quote.\(pool).\(index)")
}

// MARK: - Layout constants

private let menuWidth: CGFloat = 340
private let menuPad: CGFloat = 16
private var menuInnerWidth: CGFloat { menuWidth - menuPad * 2 }

final class MementoApp: NSObject, NSApplicationDelegate, NSMenuDelegate {
    private let defaults = UserDefaults.standard
    private let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
    private let menu = NSMenu()
    private var timer: Timer?
    private var profile: Profile
    private let dateFormatter: DateFormatter

    // Referencias vivas: el menú se construye una sola vez. Cada segundo, o
    // cuando cambia un ajuste, solo se muta el contenido de estas vistas, sin
    // reconstruir el menú — reconstruirlo cada segundo tiraría al suelo un
    // slider a medio arrastrar si el menú estuviera abierto en ese instante.
    private var headerBigLabel: NSTextField!
    private var headerMetaLabel: NSTextField!
    private var quoteLabel: NSTextField!
    // Etiqueta de valor en vivo por control: factores de estilo de vida,
    // países y los tres campos de la fecha de nacimiento.
    private var valueLabels: [String: NSTextField] = [:]
    private var controlRefs: [String: NSControl] = [:]
    private var displayToggle: NSSegmentedControl!
    private var moveAgeItem: NSMenuItem?

    override init() {
        self.dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .medium
        dateFormatter.timeStyle = .none
        self.profile = MementoApp.loadProfile(defaults: defaults)
        super.init()
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        if let button = statusItem.button {
            button.font = NSFont.monospacedDigitSystemFont(ofSize: 12, weight: .semibold)
            button.toolTip = "Memento Mori"
            button.image = skullImage()
            button.imagePosition = .imageLeading
            button.imageHugsTitle = true
        }
        menu.delegate = self
        buildMenu()
        refreshHeader()
        statusItem.menu = menu

        // .common (no solo .default) para que el contador siga latiendo
        // incluso con el menú abierto: la cuenta atrás no se detiene por
        // estar mirándola, que es justo la idea.
        let t = Timer(timeInterval: 1, repeats: true) { [weak self] _ in
            self?.tick()
        }
        RunLoop.main.add(t, forMode: .common)
        timer = t
    }

    private static func loadProfile(defaults: UserDefaults) -> Profile {
        let timestamp = defaults.object(forKey: "birthDate") as? Double
        let birthDate = timestamp.map(Date.init(timeIntervalSince1970:)) ?? defaultBirthDate()
        var factors: [String: String] = [:]
        for (key, fallback) in defaultFactors {
            factors[key] = defaults.string(forKey: key) ?? fallback
        }
        return Profile(
            birthDate: birthDate,
            birthCountry: defaults.string(forKey: "birthCountry") ?? "WLD",
            currentCountry: defaults.string(forKey: "currentCountry") ?? "WLD",
            moveAge: defaults.object(forKey: "moveAge") as? Double ?? 0,
            factors: factors,
            showDays: defaults.object(forKey: "showDays") as? Bool ?? true,
            showHours: defaults.object(forKey: "showHours") as? Bool ?? true,
            showMinutes: defaults.object(forKey: "showMinutes") as? Bool ?? true,
            showSeconds: defaults.object(forKey: "showSeconds") as? Bool ?? true,
            showPercent: defaults.object(forKey: "showPercent") as? Bool ?? true,
            // La fecha de muerte viene apagada: es la pieza más larga con
            // diferencia y ya está siempre visible al abrir el menú.
            showDeathDate: defaults.object(forKey: "showDeathDate") as? Bool ?? false
        )
    }

    private func saveProfile() {
        defaults.set(profile.birthDate.timeIntervalSince1970, forKey: "birthDate")
        defaults.set(profile.birthCountry, forKey: "birthCountry")
        defaults.set(profile.currentCountry, forKey: "currentCountry")
        defaults.set(profile.moveAge, forKey: "moveAge")
        for (key, value) in profile.factors {
            defaults.set(value, forKey: key)
        }
        defaults.set(profile.showDays, forKey: "showDays")
        defaults.set(profile.showHours, forKey: "showHours")
        defaults.set(profile.showMinutes, forKey: "showMinutes")
        defaults.set(profile.showSeconds, forKey: "showSeconds")
        defaults.set(profile.showPercent, forKey: "showPercent")
        defaults.set(profile.showDeathDate, forKey: "showDeathDate")
    }

    private func estimate(now: Date = Date()) -> Estimate {
        let age = max(0, yearsBetween(profile.birthDate, now))
        let origin = baseline(for: profile.birthCountry)
        let residence = baseline(for: profile.currentCountry)
        let migrationWeight: Double
        if profile.birthCountry == profile.currentCountry || profile.moveAge <= 0 || profile.moveAge >= age {
            migrationWeight = 0
        } else {
            migrationWeight = clamp((age - profile.moveAge) / 20, 0, 0.65)
        }
        let baselineYears = origin.years + (residence.years - origin.years) * migrationWeight
        let offset = profile.factors.reduce(0) { sum, item in
            let options = factorOptions[item.key] ?? []
            return sum + (options.first { $0.value == item.value }?.years ?? 0)
        }
        let lifeExpectancy = clamp(baselineYears + offset, 45, 105)
        let deathDate = addYears(lifeExpectancy, to: profile.birthDate)
        return Estimate(
            remaining: deathDate.timeIntervalSince(now),
            deathDate: deathDate,
            lifeExpectancy: lifeExpectancy,
            progress: clamp(age / lifeExpectancy, 0, 1)
        )
    }

    private func tick() {
        refreshHeader()
    }

    /// Se llama cada segundo y cada vez que cambia un ajuste. Solo muta texto
    /// en vistas que ya existen — nunca reconstruye el menú.
    private func refreshHeader() {
        let e = estimate()
        let pct = "\(Int(round(e.progress * 100)))%"

        // La barra enseña lo que cada uno haya elegido enseñar.
        var barParts = [formatCountdown(e.remaining, showDays: profile.showDays,
                                        showHours: profile.showHours,
                                        showMinutes: profile.showMinutes,
                                        showSeconds: profile.showSeconds)]
        if profile.showPercent { barParts.append(pct) }
        if profile.showDeathDate { barParts.append(dateFormatter.string(from: e.deathDate)) }
        statusItem.button?.title = " " + barParts.joined(separator: " · ")

        // El menú desplegado enseña siempre todo: los interruptores dicen
        // "mostrar en la barra", así que apagar algo ahí no debería esconder
        // el dato en el único sitio donde se va a mirar a propósito.
        let full = formatCountdown(e.remaining, showDays: true, showHours: true,
                                   showMinutes: true, showSeconds: true)
        headerBigLabel?.stringValue = "\(full) · \(pct)"

        let origin = countryName(profile.birthCountry)
        let place = profile.birthCountry == profile.currentCountry
            ? origin : "\(origin) → \(countryName(profile.currentCountry))"
        headerMetaLabel?.stringValue = "→ \(dateFormatter.string(from: e.deathDate))  ·  \(place)"
    }

    func menuWillOpen(_ menu: NSMenu) {
        quoteLabel?.stringValue = reflectionText(now: Date())
        refreshHeader()
    }

    // MARK: - Construcción del menú (una sola vez)

    private func buildMenu() {
        menu.addItem(headerItem())
        menu.addItem(quoteItem())
        menu.addItem(.separator())

        // "Born on 15 November 1990" / "Born in ESP" / "Living in GBR" /
        // "Since age 28": las cuatro filas se leen como una frase, en ese
        // orden, en vez de como cuatro ajustes sueltos.
        menu.addItem(sectionLabel(L("Profile")))
        menu.addItem(birthDateRow())
        menu.addItem(countryRow(labelKey: "Born in", key: "birthCountry",
                                selected: profile.birthCountry))
        menu.addItem(countryRow(labelKey: "Living in", key: "currentCountry",
                                selected: profile.currentCountry))
        let moveAge = moveAgeRow()
        moveAgeItem = moveAge
        menu.addItem(moveAge)
        updateMoveAgeVisibility()
        menu.addItem(.separator())

        menu.addItem(sectionLabel(L("Lifestyle")))
        for (key, labelKey) in segmentedFactors {
            menu.addItem(segmentedFactorRow(key: key, labelKey: labelKey))
        }
        for (key, labelKey) in sliderFactors {
            menu.addItem(sliderFactorRow(key: key, labelKey: labelKey))
        }
        menu.addItem(.separator())

        menu.addItem(displayTogglesRow())
        menu.addItem(.separator())

        let reset = NSMenuItem(title: L("Reset defaults"), action: #selector(resetDefaults), keyEquivalent: "")
        reset.target = self
        menu.addItem(reset)
        menu.addItem(.separator())

        let quit = NSMenuItem(title: L("Quit Memento Mori"), action: #selector(quit), keyEquivalent: "q")
        quit.target = self
        menu.addItem(quit)
    }

    private func rowContainer(height: CGFloat) -> NSView {
        NSView(frame: NSRect(x: 0, y: 0, width: menuWidth, height: height))
    }

    private func label(_ text: String, size: CGFloat = 12, weight: NSFont.Weight = .regular,
                       color: NSColor = .labelColor) -> NSTextField {
        let field = NSTextField(labelWithString: text)
        field.font = NSFont.systemFont(ofSize: size, weight: weight)
        field.textColor = color
        return field
    }

    private func wrap(_ view: NSView) -> NSMenuItem {
        let item = NSMenuItem()
        item.view = view
        return item
    }

    private func sectionLabel(_ text: String) -> NSMenuItem {
        let container = rowContainer(height: 22)
        let field = label(text.uppercased(), size: 10, weight: .semibold, color: .tertiaryLabelColor)
        field.frame = NSRect(x: menuPad, y: 2, width: menuInnerWidth, height: 14)
        container.addSubview(field)
        return wrap(container)
    }

    private func headerItem() -> NSMenuItem {
        // La línea meta puede envolver a dos líneas (fecha + procedencia no
        // siempre caben en una sola a este ancho, sobre todo en español, que
        // tiende a ser más largo): el contenedor tiene que ser lo bastante
        // alto para las dos, o su primera línea queda tapada por la fila de
        // abajo -exactamente el bug que se corrige aquí.
        let container = rowContainer(height: 78)
        let big = label("", size: 17, weight: .semibold)
        big.font = NSFont.monospacedDigitSystemFont(ofSize: 16, weight: .semibold)
        big.frame = NSRect(x: menuPad, y: 52, width: menuInnerWidth, height: 22)
        container.addSubview(big)
        headerBigLabel = big

        let meta = label("", size: 11, color: .secondaryLabelColor)
        meta.frame = NSRect(x: menuPad, y: 8, width: menuInnerWidth, height: 32)
        meta.lineBreakMode = .byWordWrapping
        meta.maximumNumberOfLines = 2
        meta.cell?.wraps = true
        container.addSubview(meta)
        headerMetaLabel = meta
        return wrap(container)
    }

    private func quoteItem() -> NSMenuItem {
        // Igual que arriba: el contenedor tiene que cubrir las dos líneas que
        // el campo puede llegar a envolver, o su primera línea se solapa con
        // la fila de encima.
        let container = rowContainer(height: 40)
        let field = label(reflectionText(now: Date()), size: 11, color: .secondaryLabelColor)
        field.frame = NSRect(x: menuPad, y: 2, width: menuInnerWidth, height: 34)
        field.lineBreakMode = .byWordWrapping
        field.maximumNumberOfLines = 2
        field.cell?.wraps = true
        container.addSubview(field)
        quoteLabel = field
        return wrap(container)
    }

    // MARK: - Fecha de nacimiento (steppers, no NSDatePicker)
    //
    // Un NSDatePicker de estilo texto necesita pasar a ser first responder
    // para editar el texto, y eso no llega a funcionar de forma fiable
    // dentro de la vista de un NSMenuItem: el bucle de tracking del menú no
    // le cede el foco de teclado. Tres NSStepper (día/mes/año) no necesitan
    // editar texto ni abrir una superposición propia, así que funcionan
    // exactamente igual que los sliders de Lifestyle.

    /// "Born on  [15] [November] [1990]".
    ///
    /// El mes va por nombre y no por número a propósito: 11/09 es el 11 de
    /// septiembre para un español y el 9 de noviembre para un estadounidense,
    /// y esta app se lee en los dos idiomas. Los nombres salen de
    /// standaloneMonthSymbols, así que ya vienen traducidos por el sistema y
    /// no hay que mantenerlos en el .strings.
    private func birthDateRow() -> NSMenuItem {
        let container = rowContainer(height: 30)
        let lbl = label(L("Born on"))
        lbl.frame = NSRect(x: menuPad, y: 6, width: 76, height: 18)
        container.addSubview(lbl)

        let comps = utcCalendar().dateComponents([.day, .month, .year], from: profile.birthDate)
        let currentYear = utcCalendar().component(.year, from: Date())
        let day = comps.day ?? 1
        let month = comps.month ?? 1
        let year = comps.year ?? 1990

        var x = menuPad + 76
        x = stepperField(text: String(day), value: day, x: x, valueWidth: 20, alignment: .right,
                         minVal: 1, maxVal: daysInMonth(month: month, year: year),
                         wraps: true, key: "birthDay", container: container)
        x = stepperField(text: monthName(month), value: month, x: x, valueWidth: 78, alignment: .left,
                         minVal: 1, maxVal: 12, wraps: true, key: "birthMonth", container: container)
        _ = stepperField(text: String(year), value: year, x: x, valueWidth: 34, alignment: .right,
                         minVal: 1900, maxVal: currentYear, wraps: false,
                         key: "birthYear", container: container)
        return wrap(container)
    }

    private func monthName(_ month: Int) -> String {
        let symbols = DateFormatter().standaloneMonthSymbols ?? []
        guard symbols.indices.contains(month - 1) else { return String(month) }
        return symbols[month - 1].capitalized
    }

    /// Días reales del mes: sin esto, poner 31 y luego mover el mes a febrero
    /// daba un 31 de febrero que Foundation normalizaba en silencio al 3 de
    /// marzo, moviendo la fecha de nacimiento sin avisar.
    private func daysInMonth(month: Int, year: Int) -> Int {
        var comps = DateComponents()
        comps.year = year
        comps.month = month
        comps.day = 1
        let cal = utcCalendar()
        guard let date = cal.date(from: comps),
              let range = cal.range(of: .day, in: .month, for: date) else { return 31 }
        return range.count
    }

    /// Crea el par valor+stepper de una parte de la fecha y devuelve la x
    /// donde debería empezar el siguiente elemento de la fila.
    @discardableResult
    private func stepperField(text: String, value: Int, x: CGFloat, valueWidth: CGFloat,
                              alignment: NSTextAlignment, minVal: Int, maxVal: Int, wraps: Bool,
                              key: String, container: NSView) -> CGFloat {
        let valueLabel = label(text, size: 12)
        valueLabel.alignment = alignment
        valueLabel.frame = NSRect(x: x, y: 5, width: valueWidth, height: 18)
        container.addSubview(valueLabel)
        valueLabels[key] = valueLabel

        let stepper = NSStepper(frame: NSRect(x: x + valueWidth + 2, y: 3, width: 19, height: 22))
        stepper.minValue = Double(minVal)
        stepper.maxValue = Double(maxVal)
        stepper.valueWraps = wraps
        stepper.integerValue = value
        stepper.identifier = NSUserInterfaceItemIdentifier(key)
        stepper.target = self
        stepper.action = #selector(birthDatePartChanged(_:))
        container.addSubview(stepper)
        controlRefs[key] = stepper

        return x + valueWidth + 2 + 19 + 8
    }

    // MARK: - País de nacimiento / residencia
    //
    // Antes eran sliders, y era un abuso del control: un país no está "entre"
    // otros dos, así que deslizar de la media mundial a Brasil pasando por
    // Alemania no significa nada. Lo puse así solo porque un NSPopUpButton
    // necesita abrir su propio menú superpuesto sobre el menú que ya está en
    // tracking, y eso no funciona dentro de la vista de un NSMenuItem.
    //
    // El segmented control sí es el control correcto para un conjunto pequeño
    // y sin orden: enseña las ocho opciones a la vez, se elige con un clic y
    // no finge una escala que no existe. Los segmentos llevan el código del
    // Banco Mundial -que es la fuente del dato- y el nombre completo del
    // seleccionado se lee a la derecha de la etiqueta.

    private func countryRow(labelKey: String, key: String, selected: String) -> NSMenuItem {
        let container = rowContainer(height: 46)

        // La etiqueta ocupa hasta x=146 y el nombre del país arranca en 170:
        // con 150 y 170 se solapaban doce puntos.
        let lbl = label(L(labelKey))
        lbl.frame = NSRect(x: menuPad, y: 26, width: 130, height: 16)
        container.addSubview(lbl)

        let valueLabel = label(countryName(selected), size: 12, color: .secondaryLabelColor)
        valueLabel.alignment = .right
        valueLabel.frame = NSRect(x: menuPad + 154, y: 26, width: menuInnerWidth - 154, height: 16)
        container.addSubview(valueLabel)
        valueLabels[key] = valueLabel

        let segFrame = NSRect(x: menuPad, y: 3, width: menuInnerWidth, height: 22)
        let seg = NSSegmentedControl(frame: segFrame)
        seg.segmentStyle = .rounded
        seg.segmentCount = countryOrder.count
        seg.trackingMode = .selectOne
        seg.font = NSFont.systemFont(ofSize: 10)
        let segWidth = segFrame.width / CGFloat(countryOrder.count)
        for (i, code) in countryOrder.enumerated() {
            seg.setLabel(code, forSegment: i)
            seg.setWidth(segWidth, forSegment: i)
        }
        seg.selectedSegment = countryOrder.firstIndex(of: selected) ?? 0
        seg.identifier = NSUserInterfaceItemIdentifier(key)
        seg.target = self
        seg.action = #selector(countryChanged(_:))
        container.addSubview(seg)
        controlRefs[key] = seg

        return wrap(container)
    }

    /// Solo aparece cuando los dos países difieren: si naciste y vives en el
    /// mismo sitio, la edad de mudanza no entra en el cálculo (el peso de
    /// migración es 0), así que enseñar el control sería ofrecer una palanca
    /// que no está conectada a nada.
    private func moveAgeRow() -> NSMenuItem {
        let container = rowContainer(height: 40)
        let lbl = label(L("Since age"))
        lbl.frame = NSRect(x: menuPad, y: 20, width: 220, height: 16)
        container.addSubview(lbl)

        let valueLabel = label(String(Int(profile.moveAge)), size: 12, color: .secondaryLabelColor)
        valueLabel.alignment = .right
        valueLabel.frame = NSRect(x: menuWidth - menuPad - 60, y: 20, width: 60, height: 16)
        container.addSubview(valueLabel)
        valueLabels["moveAge"] = valueLabel

        let slider = NSSlider(frame: NSRect(x: menuPad, y: 2, width: menuInnerWidth, height: 18))
        slider.minValue = 0
        slider.maxValue = 90
        slider.isContinuous = true
        slider.doubleValue = profile.moveAge
        slider.identifier = NSUserInterfaceItemIdentifier("moveAge")
        slider.target = self
        slider.action = #selector(moveAgeSliderChanged(_:))
        container.addSubview(slider)
        controlRefs["moveAge"] = slider

        return wrap(container)
    }

    private func segmentedFactorRow(key: String, labelKey: String) -> NSMenuItem {
        let container = rowContainer(height: 30)
        let options = factorOptions[key] ?? []
        let lbl = label(L(labelKey))
        lbl.frame = NSRect(x: menuPad, y: 6, width: 90, height: 18)
        container.addSubview(lbl)

        let segFrame = NSRect(x: menuPad + 90, y: 3, width: menuInnerWidth - 90, height: 24)
        let seg = NSSegmentedControl(frame: segFrame)
        seg.segmentStyle = .rounded
        seg.segmentCount = options.count
        seg.trackingMode = .selectOne
        seg.font = NSFont.systemFont(ofSize: 11)
        let segWidth = segFrame.width / CGFloat(options.count)
        for (i, opt) in options.enumerated() {
            seg.setLabel(optionLabel(key, opt.value), forSegment: i)
            seg.setWidth(segWidth, forSegment: i)
        }
        let selected = profile.factors[key] ?? defaultFactors[key]
        if let idx = options.firstIndex(where: { $0.value == selected }) {
            seg.selectedSegment = idx
        }
        seg.identifier = NSUserInterfaceItemIdentifier(key)
        seg.target = self
        seg.action = #selector(segmentedFactorChanged(_:))
        container.addSubview(seg)
        controlRefs[key] = seg
        return wrap(container)
    }

    private func sliderFactorRow(key: String, labelKey: String) -> NSMenuItem {
        let container = rowContainer(height: 46)
        let options = factorOptions[key] ?? []
        let selected = profile.factors[key] ?? defaultFactors[key]
        let selectedIdx = options.firstIndex(where: { $0.value == selected }) ?? 0

        let lbl = label(L(labelKey))
        lbl.frame = NSRect(x: menuPad, y: 26, width: 150, height: 16)
        container.addSubview(lbl)

        let valueLabel = label(optionLabel(key, options[selectedIdx].value), size: 12, color: .secondaryLabelColor)
        valueLabel.alignment = .right
        valueLabel.frame = NSRect(x: menuWidth - menuPad - 150, y: 26, width: 150, height: 16)
        container.addSubview(valueLabel)
        valueLabels[key] = valueLabel

        let slider = NSSlider(frame: NSRect(x: menuPad, y: 4, width: menuInnerWidth, height: 20))
        slider.minValue = 0
        slider.maxValue = Double(options.count - 1)
        slider.numberOfTickMarks = options.count
        slider.allowsTickMarkValuesOnly = true
        slider.tickMarkPosition = .below
        slider.isContinuous = true
        slider.doubleValue = Double(selectedIdx)
        slider.identifier = NSUserInterfaceItemIdentifier(key)
        slider.target = self
        slider.action = #selector(sliderFactorChanged(_:))
        container.addSubview(slider)
        controlRefs[key] = slider

        return wrap(container)
    }

    /// Seis interruptores: cuántas unidades de la cuenta atrás se ven, más el
    /// porcentaje y la fecha de muerte. A dos líneas -etiqueta arriba, control
    /// a todo el ancho abajo- porque seis segmentos no caben en media fila.
    private func displayTogglesRow() -> NSMenuItem {
        let container = rowContainer(height: 48)
        let lbl = label(L("Show in menu bar"))
        lbl.frame = NSRect(x: menuPad, y: 28, width: menuInnerWidth, height: 16)
        container.addSubview(lbl)

        let segFrame = NSRect(x: menuPad, y: 3, width: menuInnerWidth, height: 24)
        let seg = NSSegmentedControl(frame: segFrame)
        seg.segmentStyle = .rounded
        seg.segmentCount = 6
        seg.trackingMode = .selectAny
        seg.font = NSFont.systemFont(ofSize: 11)
        // D/H/M/S: iniciales de días/horas/minutos/segundos, iguales en inglés
        // y en español (día, hora, minuto, segundo). El % tampoco cambia. Solo
        // la fecha necesita traducción.
        let labels = ["D", "H", "M", "S", "%", L("toggle.date")]
        for i in 0..<labels.count {
            seg.setLabel(labels[i], forSegment: i)
            seg.setWidth(segFrame.width / CGFloat(labels.count), forSegment: i)
        }
        seg.target = self
        seg.action = #selector(displayTogglesChanged(_:))
        container.addSubview(seg)
        displayToggle = seg
        syncDisplayToggle()
        return wrap(container)
    }

    private func syncDisplayToggle() {
        let flags = [profile.showDays, profile.showHours, profile.showMinutes,
                     profile.showSeconds, profile.showPercent, profile.showDeathDate]
        for (i, on) in flags.enumerated() {
            displayToggle?.setSelected(on, forSegment: i)
        }
    }

    // MARK: - Acciones

    @objc private func resetDefaults() {
        profile = Profile(
            birthDate: defaultBirthDate(),
            birthCountry: "WLD",
            currentCountry: "WLD",
            moveAge: 0,
            factors: defaultFactors,
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
            showPercent: true,
            showDeathDate: false
        )
        saveProfile()
        syncControlsToProfile()
    }

    /// Reset defaults es el único punto donde varios controles cambian a la
    /// vez desde fuera; en vez de reconstruir el menú, se reescribe el valor
    /// mostrado de cada control ya existente.
    private func syncControlsToProfile() {
        let comps = utcCalendar().dateComponents([.day, .month, .year], from: profile.birthDate)
        let month = comps.month ?? 1
        let year = comps.year ?? 1990
        (controlRefs["birthDay"] as? NSStepper)?.maxValue = Double(daysInMonth(month: month, year: year))
        for (key, value) in [("birthDay", comps.day ?? 1), ("birthMonth", month), ("birthYear", year)] {
            (controlRefs[key] as? NSStepper)?.integerValue = value
            valueLabels[key]?.stringValue = key == "birthMonth" ? monthName(value) : String(value)
        }

        for key in ["birthCountry", "currentCountry"] {
            let code = key == "birthCountry" ? profile.birthCountry : profile.currentCountry
            (controlRefs[key] as? NSSegmentedControl)?.selectedSegment = countryOrder.firstIndex(of: code) ?? 0
            valueLabels[key]?.stringValue = countryName(code)
        }

        (controlRefs["moveAge"] as? NSSlider)?.doubleValue = profile.moveAge
        valueLabels["moveAge"]?.stringValue = String(Int(profile.moveAge))
        updateMoveAgeVisibility()

        for (key, _) in segmentedFactors {
            guard let seg = controlRefs[key] as? NSSegmentedControl else { continue }
            let options = factorOptions[key] ?? []
            let selected = profile.factors[key] ?? defaultFactors[key]
            if let idx = options.firstIndex(where: { $0.value == selected }) {
                seg.selectedSegment = idx
            }
        }
        for (key, _) in sliderFactors {
            guard let slider = controlRefs[key] as? NSSlider else { continue }
            let options = factorOptions[key] ?? []
            let selected = profile.factors[key] ?? defaultFactors[key]
            let idx = options.firstIndex(where: { $0.value == selected }) ?? 0
            slider.doubleValue = Double(idx)
            valueLabels[key]?.stringValue = optionLabel(key, options[idx].value)
        }

        syncDisplayToggle()
        refreshHeader()
    }

    private func updateMoveAgeVisibility() {
        moveAgeItem?.isHidden = profile.birthCountry == profile.currentCountry
    }

    @objc private func quit() {
        NSApp.terminate(nil)
    }

    @objc private func birthDatePartChanged(_ sender: NSStepper) {
        _ = sender  // los tres steppers se leen juntos desde controlRefs
        let month = (controlRefs["birthMonth"] as? NSStepper)?.integerValue ?? 1
        let year = (controlRefs["birthYear"] as? NSStepper)?.integerValue ?? 1990

        // Al cambiar de mes o de año el tope de días cambia con él, así que se
        // reajusta el stepper del día y, si el día elegido ya no existe en ese
        // mes, se recorta a la baja en vez de dejar que la fecha se desplace.
        let maxDay = daysInMonth(month: month, year: year)
        let dayStepper = controlRefs["birthDay"] as? NSStepper
        dayStepper?.maxValue = Double(maxDay)
        let day = min(dayStepper?.integerValue ?? 1, maxDay)
        dayStepper?.integerValue = day

        valueLabels["birthDay"]?.stringValue = String(day)
        valueLabels["birthMonth"]?.stringValue = monthName(month)
        valueLabels["birthYear"]?.stringValue = String(year)

        var comps = DateComponents()
        comps.day = day
        comps.month = month
        comps.year = year
        guard let date = utcCalendar().date(from: comps) else { return }
        profile.birthDate = date
        saveProfile()
        refreshHeader()
    }

    @objc private func countryChanged(_ sender: NSSegmentedControl) {
        guard let key = sender.identifier?.rawValue else { return }
        let idx = sender.selectedSegment
        guard countryOrder.indices.contains(idx) else { return }
        let code = countryOrder[idx]
        if key == "birthCountry" {
            profile.birthCountry = code
        } else if key == "currentCountry" {
            profile.currentCountry = code
        }
        valueLabels[key]?.stringValue = countryName(code)
        saveProfile()
        updateMoveAgeVisibility()
        refreshHeader()
    }

    @objc private func moveAgeSliderChanged(_ sender: NSSlider) {
        profile.moveAge = sender.doubleValue.rounded()
        valueLabels["moveAge"]?.stringValue = String(Int(profile.moveAge))
        saveProfile()
        refreshHeader()
    }

    @objc private func segmentedFactorChanged(_ sender: NSSegmentedControl) {
        guard let key = sender.identifier?.rawValue else { return }
        let options = factorOptions[key] ?? []
        let idx = sender.selectedSegment
        guard options.indices.contains(idx) else { return }
        profile.factors[key] = options[idx].value
        saveProfile()
        refreshHeader()
    }

    @objc private func sliderFactorChanged(_ sender: NSSlider) {
        guard let key = sender.identifier?.rawValue else { return }
        let options = factorOptions[key] ?? []
        let idx = Int(sender.doubleValue.rounded())
        guard options.indices.contains(idx) else { return }
        profile.factors[key] = options[idx].value
        valueLabels[key]?.stringValue = optionLabel(key, options[idx].value)
        saveProfile()
        refreshHeader()
    }

    @objc private func displayTogglesChanged(_ sender: NSSegmentedControl) {
        profile.showDays = sender.isSelected(forSegment: 0)
        profile.showHours = sender.isSelected(forSegment: 1)
        profile.showMinutes = sender.isSelected(forSegment: 2)
        profile.showSeconds = sender.isSelected(forSegment: 3)
        profile.showPercent = sender.isSelected(forSegment: 4)
        profile.showDeathDate = sender.isSelected(forSegment: 5)
        saveProfile()
        refreshHeader()
    }
}

let app = NSApplication.shared
let delegate = MementoApp()
app.delegate = delegate
app.run()
