import AppKit
import Foundation

private let secondsPerYear = 365.2425 * 24.0 * 60.0 * 60.0

private struct Baseline {
    let label: String
    let years: Double
    let year: Int
}

private let baselines: [String: Baseline] = [
    "WLD": Baseline(label: "World average", years: 73.480380292779, year: 2024),
    "USA": Baseline(label: "United States", years: 78.890243902439, year: 2024),
    "GBR": Baseline(label: "United Kingdom", years: 81.3868536585366, year: 2024),
    "DEU": Baseline(label: "Germany", years: 80.7926829268293, year: 2024),
    "ESP": Baseline(label: "Spain", years: 83.8878048780488, year: 2024),
    "JPN": Baseline(label: "Japan", years: 84.0363414634146, year: 2024),
    "IND": Baseline(label: "India", years: 72.235, year: 2024),
    "BRA": Baseline(label: "Brazil", years: 76.023, year: 2024)
]

private let countryOrder = ["WLD", "USA", "GBR", "DEU", "ESP", "JPN", "IND", "BRA"]

private struct FactorOption {
    let value: String
    let label: String
    let years: Double
}

// "skip" vive siempre en el índice 0: es la posición neutra en la que un
// slider o un segmented control no aporta ni resta nada a la estimación.
// Sexo/sueño/salud son categorías sin orden natural (segmented control);
// ejercicio/alcohol/tabaco sí son un espectro, por eso son sliders.
private let factorOptions: [String: [FactorOption]] = [
    "sex": [
        FactorOption(value: "skip", label: "–", years: 0),
        FactorOption(value: "male", label: "M", years: -2.4),
        FactorOption(value: "female", label: "F", years: 3.1)
    ],
    "sleep": [
        FactorOption(value: "skip", label: "–", years: 0),
        FactorOption(value: "stable", label: "Stable", years: 1),
        FactorOption(value: "irregular", label: "Irregular", years: -1.2)
    ],
    "exercise": [
        FactorOption(value: "skip", label: "Skip", years: 0),
        FactorOption(value: "sedentary", label: "Sedentary", years: -2.5),
        FactorOption(value: "light", label: "Light", years: -0.6),
        FactorOption(value: "moderate", label: "Moderate", years: 0.8),
        FactorOption(value: "regular", label: "Regular", years: 2.0),
        FactorOption(value: "athletic", label: "Athletic", years: 3.4)
    ],
    "drinking": [
        FactorOption(value: "skip", label: "Skip", years: 0),
        FactorOption(value: "none", label: "None", years: 0.6),
        FactorOption(value: "light", label: "Light", years: 0.3),
        FactorOption(value: "moderate", label: "Moderate", years: -0.9),
        FactorOption(value: "frequent", label: "Frequent", years: -2.1),
        FactorOption(value: "heavy", label: "Heavy", years: -3.8)
    ],
    "smoking": [
        FactorOption(value: "skip", label: "Skip", years: 0),
        FactorOption(value: "never", label: "Never", years: 1.2),
        FactorOption(value: "former", label: "Former", years: 0.4),
        FactorOption(value: "occasional", label: "Occasional", years: -1.6),
        FactorOption(value: "regular", label: "Regular", years: -3.3),
        FactorOption(value: "heavy", label: "Heavy", years: -5.6)
    ],
    "health": [
        FactorOption(value: "skip", label: "–", years: 0),
        FactorOption(value: "none", label: "OK", years: 1),
        FactorOption(value: "managed", label: "Managed", years: -1),
        FactorOption(value: "serious", label: "Serious", years: -4)
    ]
]

// Filas con segmented control (categorías sin orden) frente a filas con
// slider (espectro). El orden aquí es el orden en que aparecen en el menú.
private let segmentedFactors: [(key: String, label: String)] = [
    ("sex", "Sex"), ("sleep", "Sleep"), ("health", "Health")
]
private let sliderFactors: [(key: String, label: String)] = [
    ("exercise", "Exercise"), ("drinking", "Drinking"), ("smoking", "Smoking")
]

private struct Profile {
    var birthDate: Date
    var birthCountry: String
    var currentCountry: String
    var moveAge: Double
    var skin: String
    var factors: [String: String]
    var showHours: Bool
    var showMinutes: Bool
    var showSeconds: Bool
}

private struct Estimate {
    let remaining: TimeInterval
    let deathDate: Date
    let lifeExpectancy: Double
    let baselineLabel: String
    let baselineYear: Int
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

private func baseline(for code: String) -> Baseline {
    baselines[code] ?? baselines["WLD"]!
}

/// Cuenta atrás con granularidad configurable. Años y días son la base fija;
/// horas, minutos y segundos son independientes entre sí porque en Settings
/// cada uno tiene su propio interruptor.
private func formatCountdown(_ secondsValue: TimeInterval, showHours: Bool,
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

    var parts = ["\(years)y", "\(days)d"]
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
    let regular = [
        "Unless the plan is to become excellent at postponing your life.",
        "Make the bed. Tiny empire, low taxes, immediate regime change.",
        "You are not owed a calmer season. Adorable theory, though.",
        "The obstacle is probably not fate. Check the task you are avoiding."
    ]
    let late = [
        "If it is late enough to doomscroll, teeth remain a bold option.",
        "Tomorrow's self has reviewed your leadership and left notes."
    ]
    let pool = hour >= 22 || hour < 5 ? late : regular
    let index = abs((minute * 7 + second * 13 + hour) % pool.count)
    return pool[index]
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
    private var paletteMenuItem: NSMenuItem!
    private var factorValueLabels: [String: NSTextField] = [:]
    private var controlRefs: [String: NSControl] = [:]
    private var displayToggle: NSSegmentedControl!

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
        for key in ["sex", "sleep", "exercise", "drinking", "smoking", "health"] {
            factors[key] = defaults.string(forKey: key) ?? "skip"
        }
        return Profile(
            birthDate: birthDate,
            birthCountry: defaults.string(forKey: "birthCountry") ?? "WLD",
            currentCountry: defaults.string(forKey: "currentCountry") ?? "WLD",
            moveAge: defaults.object(forKey: "moveAge") as? Double ?? 0,
            skin: defaults.string(forKey: "skin") ?? "system-light",
            factors: factors,
            showHours: defaults.object(forKey: "showHours") as? Bool ?? true,
            showMinutes: defaults.object(forKey: "showMinutes") as? Bool ?? true,
            showSeconds: defaults.object(forKey: "showSeconds") as? Bool ?? true
        )
    }

    private func saveProfile() {
        defaults.set(profile.birthDate.timeIntervalSince1970, forKey: "birthDate")
        defaults.set(profile.birthCountry, forKey: "birthCountry")
        defaults.set(profile.currentCountry, forKey: "currentCountry")
        defaults.set(profile.moveAge, forKey: "moveAge")
        defaults.set(profile.skin, forKey: "skin")
        for (key, value) in profile.factors {
            defaults.set(value, forKey: key)
        }
        defaults.set(profile.showHours, forKey: "showHours")
        defaults.set(profile.showMinutes, forKey: "showMinutes")
        defaults.set(profile.showSeconds, forKey: "showSeconds")
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
        let baselineLabel = profile.birthCountry == profile.currentCountry ? origin.label : "\(origin.label) -> \(residence.label)"
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
            baselineLabel: baselineLabel,
            baselineYear: max(origin.year, residence.year),
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
        let text = formatCountdown(e.remaining, showHours: profile.showHours,
                                   showMinutes: profile.showMinutes, showSeconds: profile.showSeconds)
        statusItem.button?.title = " " + text
        headerBigLabel?.stringValue = text
        headerMetaLabel?.stringValue = "→ \(dateFormatter.string(from: e.deathDate))  ·  "
            + "\(e.baselineLabel)  ·  \(Int(round(e.progress * 100)))% elapsed"
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

        menu.addItem(sectionLabel("Profile"))
        menu.addItem(birthDateRow())
        menu.addItem(countriesRow())
        menu.addItem(moveAgeRow())
        menu.addItem(.separator())

        menu.addItem(sectionLabel("Lifestyle"))
        for (key, label) in segmentedFactors {
            menu.addItem(segmentedFactorRow(key: key, label: label))
        }
        for (key, label) in sliderFactors {
            menu.addItem(sliderFactorRow(key: key, label: label))
        }
        menu.addItem(.separator())

        menu.addItem(displayTogglesRow())
        menu.addItem(.separator())

        let palette = NSMenuItem(title: paletteTitle(), action: #selector(toggleSkin), keyEquivalent: "")
        palette.target = self
        paletteMenuItem = palette
        menu.addItem(palette)

        let reset = NSMenuItem(title: "Reset defaults", action: #selector(resetDefaults), keyEquivalent: "")
        reset.target = self
        menu.addItem(reset)
        menu.addItem(.separator())

        let quit = NSMenuItem(title: "Quit Memento Mori", action: #selector(quit), keyEquivalent: "q")
        quit.target = self
        menu.addItem(quit)
    }

    private func paletteTitle() -> String {
        profile.skin == "system-dark" ? "Use bone and ash" : "Use onyx"
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
        let container = rowContainer(height: 54)
        let big = label("", size: 17, weight: .semibold)
        big.font = NSFont.monospacedDigitSystemFont(ofSize: 16, weight: .semibold)
        big.frame = NSRect(x: menuPad, y: 28, width: menuInnerWidth, height: 22)
        container.addSubview(big)
        headerBigLabel = big

        let meta = label("", size: 11, color: .secondaryLabelColor)
        meta.frame = NSRect(x: menuPad, y: 8, width: menuInnerWidth, height: 16)
        container.addSubview(meta)
        headerMetaLabel = meta
        return wrap(container)
    }

    private func quoteItem() -> NSMenuItem {
        let container = rowContainer(height: 26)
        let field = label(reflectionText(now: Date()), size: 11, color: .secondaryLabelColor)
        field.frame = NSRect(x: menuPad, y: 4, width: menuInnerWidth, height: 32)
        field.lineBreakMode = .byWordWrapping
        field.maximumNumberOfLines = 2
        field.cell?.wraps = true
        container.addSubview(field)
        quoteLabel = field
        return wrap(container)
    }

    private func birthDateRow() -> NSMenuItem {
        let container = rowContainer(height: 30)
        let lbl = label("Birth date")
        lbl.frame = NSRect(x: menuPad, y: 6, width: 100, height: 18)
        container.addSubview(lbl)

        let picker = NSDatePicker(frame: NSRect(x: menuPad + 100, y: 2, width: menuInnerWidth - 100, height: 26))
        picker.datePickerStyle = .textField
        picker.datePickerElements = [.yearMonthDay]
        picker.dateValue = profile.birthDate
        picker.target = self
        picker.action = #selector(birthDateChanged(_:))
        container.addSubview(picker)
        controlRefs["birthDate"] = picker
        return wrap(container)
    }

    private func countriesRow() -> NSMenuItem {
        let container = rowContainer(height: 46)
        let half = (menuInnerWidth - 10) / 2

        let bornCaption = label("BORN", size: 9, weight: .medium, color: .tertiaryLabelColor)
        bornCaption.frame = NSRect(x: menuPad, y: 30, width: half, height: 12)
        container.addSubview(bornCaption)

        let livingCaption = label("LIVING IN", size: 9, weight: .medium, color: .tertiaryLabelColor)
        livingCaption.frame = NSRect(x: menuPad + half + 10, y: 30, width: half, height: 12)
        container.addSubview(livingCaption)

        let bornPopup = countryPopup(selected: profile.birthCountry,
                                     frame: NSRect(x: menuPad, y: 4, width: half, height: 24))
        bornPopup.identifier = NSUserInterfaceItemIdentifier("birthCountry")
        bornPopup.target = self
        bornPopup.action = #selector(countryChanged(_:))
        container.addSubview(bornPopup)
        controlRefs["birthCountry"] = bornPopup

        let livingPopup = countryPopup(selected: profile.currentCountry,
                                       frame: NSRect(x: menuPad + half + 10, y: 4, width: half, height: 24))
        livingPopup.identifier = NSUserInterfaceItemIdentifier("currentCountry")
        livingPopup.target = self
        livingPopup.action = #selector(countryChanged(_:))
        container.addSubview(livingPopup)
        controlRefs["currentCountry"] = livingPopup

        return wrap(container)
    }

    private func countryPopup(selected: String, frame: NSRect) -> NSPopUpButton {
        let popup = NSPopUpButton(frame: frame, pullsDown: false)
        popup.font = NSFont.systemFont(ofSize: 11)
        for code in countryOrder {
            popup.addItem(withTitle: baseline(for: code).label)
            popup.lastItem?.representedObject = code
        }
        popup.selectItem(withTitle: baseline(for: selected).label)
        return popup
    }

    private func moveAgeRow() -> NSMenuItem {
        let container = rowContainer(height: 30)
        let lbl = label("Moved at age")
        lbl.frame = NSRect(x: menuPad, y: 6, width: 160, height: 18)
        container.addSubview(lbl)

        let field = NSTextField(frame: NSRect(x: menuWidth - menuPad - 70, y: 3, width: 70, height: 24))
        field.alignment = .right
        field.stringValue = String(Int(profile.moveAge))
        field.target = self
        field.action = #selector(moveAgeChanged(_:))
        container.addSubview(field)
        controlRefs["moveAge"] = field
        return wrap(container)
    }

    private func segmentedFactorRow(key: String, label labelText: String) -> NSMenuItem {
        let container = rowContainer(height: 30)
        let options = factorOptions[key] ?? []
        let lbl = label(labelText)
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
            seg.setLabel(opt.label, forSegment: i)
            seg.setWidth(segWidth, forSegment: i)
        }
        let selected = profile.factors[key] ?? "skip"
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

    private func sliderFactorRow(key: String, label labelText: String) -> NSMenuItem {
        let container = rowContainer(height: 46)
        let options = factorOptions[key] ?? []
        let selected = profile.factors[key] ?? "skip"
        let selectedIdx = options.firstIndex(where: { $0.value == selected }) ?? 0

        let lbl = label(labelText)
        lbl.frame = NSRect(x: menuPad, y: 26, width: 150, height: 16)
        container.addSubview(lbl)

        let valueLabel = label(options[selectedIdx].label, size: 12, color: .secondaryLabelColor)
        valueLabel.alignment = .right
        valueLabel.frame = NSRect(x: menuWidth - menuPad - 150, y: 26, width: 150, height: 16)
        container.addSubview(valueLabel)
        factorValueLabels[key] = valueLabel

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

    private func displayTogglesRow() -> NSMenuItem {
        let container = rowContainer(height: 30)
        let lbl = label("Show in menu bar")
        lbl.frame = NSRect(x: menuPad, y: 6, width: 150, height: 18)
        container.addSubview(lbl)

        let segFrame = NSRect(x: menuWidth - menuPad - 130, y: 3, width: 130, height: 24)
        let seg = NSSegmentedControl(frame: segFrame)
        seg.segmentStyle = .rounded
        seg.segmentCount = 3
        seg.trackingMode = .selectAny
        seg.font = NSFont.systemFont(ofSize: 11)
        let labels = ["H", "M", "S"]
        for i in 0..<3 {
            seg.setLabel(labels[i], forSegment: i)
            seg.setWidth(segFrame.width / 3, forSegment: i)
        }
        seg.setSelected(profile.showHours, forSegment: 0)
        seg.setSelected(profile.showMinutes, forSegment: 1)
        seg.setSelected(profile.showSeconds, forSegment: 2)
        seg.target = self
        seg.action = #selector(displayTogglesChanged(_:))
        container.addSubview(seg)
        displayToggle = seg
        return wrap(container)
    }

    // MARK: - Acciones

    @objc private func toggleSkin() {
        profile.skin = profile.skin == "system-dark" ? "system-light" : "system-dark"
        saveProfile()
        paletteMenuItem?.title = paletteTitle()
        refreshHeader()
    }

    @objc private func resetDefaults() {
        profile = Profile(
            birthDate: defaultBirthDate(),
            birthCountry: "WLD",
            currentCountry: "WLD",
            moveAge: 0,
            skin: "system-light",
            factors: ["sex": "skip", "sleep": "skip", "exercise": "skip", "drinking": "skip", "smoking": "skip", "health": "skip"],
            showHours: true,
            showMinutes: true,
            showSeconds: true
        )
        saveProfile()
        syncControlsToProfile()
    }

    /// Reset defaults es el único punto donde varios controles cambian a la
    /// vez desde fuera; en vez de reconstruir el menú, se reescribe el valor
    /// mostrado de cada control ya existente.
    private func syncControlsToProfile() {
        (controlRefs["birthDate"] as? NSDatePicker)?.dateValue = profile.birthDate
        (controlRefs["birthCountry"] as? NSPopUpButton)?.selectItem(withTitle: baseline(for: profile.birthCountry).label)
        (controlRefs["currentCountry"] as? NSPopUpButton)?.selectItem(withTitle: baseline(for: profile.currentCountry).label)
        (controlRefs["moveAge"] as? NSTextField)?.stringValue = String(Int(profile.moveAge))

        for (key, label: _) in segmentedFactors {
            guard let seg = controlRefs[key] as? NSSegmentedControl else { continue }
            let options = factorOptions[key] ?? []
            let selected = profile.factors[key] ?? "skip"
            if let idx = options.firstIndex(where: { $0.value == selected }) {
                seg.selectedSegment = idx
            }
        }
        for (key, label: _) in sliderFactors {
            guard let slider = controlRefs[key] as? NSSlider else { continue }
            let options = factorOptions[key] ?? []
            let selected = profile.factors[key] ?? "skip"
            let idx = options.firstIndex(where: { $0.value == selected }) ?? 0
            slider.doubleValue = Double(idx)
            factorValueLabels[key]?.stringValue = options[idx].label
        }

        paletteMenuItem?.title = paletteTitle()
        displayToggle?.setSelected(profile.showHours, forSegment: 0)
        displayToggle?.setSelected(profile.showMinutes, forSegment: 1)
        displayToggle?.setSelected(profile.showSeconds, forSegment: 2)

        refreshHeader()
    }

    @objc private func quit() {
        NSApp.terminate(nil)
    }

    @objc private func birthDateChanged(_ sender: NSDatePicker) {
        profile.birthDate = sender.dateValue
        saveProfile()
        refreshHeader()
    }

    @objc private func countryChanged(_ sender: NSPopUpButton) {
        guard let key = sender.identifier?.rawValue,
              let value = sender.selectedItem?.representedObject as? String else { return }
        if key == "birthCountry" {
            profile.birthCountry = value
        } else if key == "currentCountry" {
            profile.currentCountry = value
        }
        saveProfile()
        refreshHeader()
    }

    @objc private func moveAgeChanged(_ sender: NSTextField) {
        profile.moveAge = clamp(Double(sender.stringValue) ?? 0, 0, 110)
        sender.stringValue = String(Int(profile.moveAge))
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
        factorValueLabels[key]?.stringValue = options[idx].label
        saveProfile()
        refreshHeader()
    }

    @objc private func displayTogglesChanged(_ sender: NSSegmentedControl) {
        profile.showHours = sender.isSelected(forSegment: 0)
        profile.showMinutes = sender.isSelected(forSegment: 1)
        profile.showSeconds = sender.isSelected(forSegment: 2)
        saveProfile()
        refreshHeader()
    }
}

let app = NSApplication.shared
let delegate = MementoApp()
app.delegate = delegate
app.run()
