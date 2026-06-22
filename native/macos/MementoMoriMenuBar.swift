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

private let factorOptions: [String: [FactorOption]] = [
    "sex": [
        FactorOption(value: "skip", label: "Skip", years: 0),
        FactorOption(value: "male", label: "Male", years: -2.4),
        FactorOption(value: "female", label: "Female", years: 3.1)
    ],
    "sleep": [
        FactorOption(value: "skip", label: "Skip", years: 0),
        FactorOption(value: "stable", label: "Stable", years: 1),
        FactorOption(value: "irregular", label: "Irregular", years: -1.2)
    ],
    "exercise": [
        FactorOption(value: "skip", label: "Skip", years: 0),
        FactorOption(value: "regular", label: "Regular", years: 2),
        FactorOption(value: "low", label: "Low", years: -2)
    ],
    "drinking": [
        FactorOption(value: "skip", label: "Skip", years: 0),
        FactorOption(value: "low", label: "Low", years: 0.4),
        FactorOption(value: "high", label: "High", years: -2.2)
    ],
    "smoking": [
        FactorOption(value: "skip", label: "Skip", years: 0),
        FactorOption(value: "none", label: "None", years: 1.2),
        FactorOption(value: "former", label: "Former", years: 0.4),
        FactorOption(value: "current", label: "Current", years: -4.5)
    ],
    "health": [
        FactorOption(value: "skip", label: "Skip", years: 0),
        FactorOption(value: "none", label: "No known major condition", years: 1),
        FactorOption(value: "managed", label: "Managed condition", years: -1),
        FactorOption(value: "serious", label: "Serious current condition", years: -4)
    ]
]

private struct Profile {
    var birthDate: Date
    var birthCountry: String
    var currentCountry: String
    var moveAge: Double
    var skin: String
    var factors: [String: String]
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

private func durationText(_ secondsValue: TimeInterval) -> String {
    var seconds = Int(abs(secondsValue))
    let years = Int(Double(seconds) / secondsPerYear)
    seconds -= Int(Double(years) * secondsPerYear)
    let days = seconds / 86_400
    seconds -= days * 86_400
    let hours = seconds / 3_600
    seconds -= hours * 3_600
    let minutes = seconds / 60
    seconds -= minutes * 60
    let prefix = secondsValue < 0 ? "+" : ""
    return "\(prefix)\(years)y \(days)d \(hours)h \(minutes)m \(seconds)s"
}

private func shortDurationText(_ secondsValue: TimeInterval) -> String {
    var seconds = Int(abs(secondsValue))
    let years = Int(Double(seconds) / secondsPerYear)
    seconds -= Int(Double(years) * secondsPerYear)
    let days = seconds / 86_400
    seconds -= days * 86_400
    let hours = seconds / 3_600
    let prefix = secondsValue < 0 ? "+" : ""
    return "\(prefix)\(years)y \(days)d \(hours)h"
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

final class MementoApp: NSObject, NSApplicationDelegate {
    private let defaults = UserDefaults.standard
    private let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
    private let menu = NSMenu()
    private var timer: Timer?
    private var settingsWindow: NSWindow?
    private var profile: Profile
    private let dateFormatter: DateFormatter

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
        }
        rebuildMenu()
        update()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            self?.update()
        }
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
            factors: factors
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

    private func update() {
        let current = estimate()
        statusItem.button?.title = "MM \(shortDurationText(current.remaining))"
        statusItem.button?.appearsDisabled = false
        rebuildMenu()
    }

    private func rebuildMenu() {
        let current = estimate()
        menu.removeAllItems()
        menu.addItem(disabled("MM \(durationText(current.remaining))"))
        menu.addItem(disabled("Death date: \(dateFormatter.string(from: current.deathDate))"))
        menu.addItem(disabled("Model age: \(String(format: "%.2f", current.lifeExpectancy)) years"))
        menu.addItem(disabled("Place model: \(current.baselineLabel), \(current.baselineYear)"))
        menu.addItem(disabled("Progress: \(Int(round(current.progress * 100)))% elapsed"))
        menu.addItem(.separator())
        menu.addItem(disabled(reflectionText(now: Date())))
        menu.addItem(.separator())
        let palette = NSMenuItem(title: profile.skin == "system-dark" ? "Use bone and ash" : "Use onyx", action: #selector(toggleSkin), keyEquivalent: "")
        palette.target = self
        menu.addItem(palette)
        let settings = NSMenuItem(title: "Settings...", action: #selector(openSettings), keyEquivalent: ",")
        settings.target = self
        menu.addItem(settings)
        let reset = NSMenuItem(title: "Reset defaults", action: #selector(resetDefaults), keyEquivalent: "")
        reset.target = self
        menu.addItem(reset)
        menu.addItem(.separator())
        let quit = NSMenuItem(title: "Quit Memento Mori", action: #selector(quit), keyEquivalent: "q")
        quit.target = self
        menu.addItem(quit)
        statusItem.menu = menu
    }

    private func disabled(_ title: String) -> NSMenuItem {
        let item = NSMenuItem(title: title, action: nil, keyEquivalent: "")
        item.isEnabled = false
        return item
    }

    @objc private func toggleSkin() {
        profile.skin = profile.skin == "system-dark" ? "system-light" : "system-dark"
        saveProfile()
        update()
    }

    @objc private func resetDefaults() {
        profile = Profile(
            birthDate: defaultBirthDate(),
            birthCountry: "WLD",
            currentCountry: "WLD",
            moveAge: 0,
            skin: "system-light",
            factors: ["sex": "skip", "sleep": "skip", "exercise": "skip", "drinking": "skip", "smoking": "skip", "health": "skip"]
        )
        saveProfile()
        settingsWindow?.close()
        settingsWindow = nil
        update()
    }

    @objc private func quit() {
        NSApp.terminate(nil)
    }

    @objc private func openSettings() {
        if let settingsWindow {
            settingsWindow.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
            return
        }

        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 430, height: 520),
            styleMask: [.titled, .closable],
            backing: .buffered,
            defer: false
        )
        window.title = "Memento Mori Settings"
        window.center()
        window.contentView = settingsView()
        window.isReleasedWhenClosed = false
        settingsWindow = window
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    private func settingsView() -> NSView {
        let view = NSView(frame: NSRect(x: 0, y: 0, width: 430, height: 520))
        var y = 470

        let title = NSTextField(labelWithString: "Memento Mori widget")
        title.font = NSFont.systemFont(ofSize: 20, weight: .semibold)
        title.frame = NSRect(x: 22, y: y, width: 380, height: 26)
        view.addSubview(title)
        y -= 42

        addDateRow(to: view, label: "Birth date", y: y)
        y -= 44
        addCountryRow(to: view, label: "Birth country", key: "birthCountry", selected: profile.birthCountry, y: y)
        y -= 44
        addCountryRow(to: view, label: "Living in country", key: "currentCountry", selected: profile.currentCountry, y: y)
        y -= 44
        addMoveAgeRow(to: view, y: y)
        y -= 52

        for item in [
            ("Sex", "sex"),
            ("Sleep", "sleep"),
            ("Exercise", "exercise"),
            ("Drinking", "drinking"),
            ("Smoking", "smoking"),
            ("Health conditions?", "health")
        ] {
            addFactorRow(to: view, label: item.0, key: item.1, y: y)
            y -= 38
        }

        let disclaimer = NSTextField(wrappingLabelWithString: "Approximation only. Not medical, legal, actuarial, insurance, or mental-health advice.")
        disclaimer.frame = NSRect(x: 22, y: 20, width: 386, height: 40)
        disclaimer.textColor = .secondaryLabelColor
        view.addSubview(disclaimer)
        return view
    }

    private func addLabel(_ label: String, to view: NSView, y: Int) {
        let field = NSTextField(labelWithString: label)
        field.frame = NSRect(x: 22, y: y + 6, width: 132, height: 22)
        view.addSubview(field)
    }

    private func addDateRow(to view: NSView, label: String, y: Int) {
        addLabel(label, to: view, y: y)
        let picker = NSDatePicker(frame: NSRect(x: 164, y: y, width: 230, height: 30))
        picker.datePickerStyle = .textField
        picker.datePickerElements = [.yearMonthDay]
        picker.dateValue = profile.birthDate
        picker.target = self
        picker.action = #selector(birthDateChanged(_:))
        view.addSubview(picker)
    }

    private func addCountryRow(to view: NSView, label: String, key: String, selected: String, y: Int) {
        addLabel(label, to: view, y: y)
        let popup = NSPopUpButton(frame: NSRect(x: 164, y: y, width: 230, height: 30), pullsDown: false)
        for code in countryOrder {
            popup.addItem(withTitle: "\(baseline(for: code).label) (\(code))")
            popup.lastItem?.representedObject = code
        }
        popup.selectItem(withTitle: "\(baseline(for: selected).label) (\(selected))")
        popup.identifier = NSUserInterfaceItemIdentifier(key)
        popup.target = self
        popup.action = #selector(countryChanged(_:))
        view.addSubview(popup)
    }

    private func addMoveAgeRow(to view: NSView, y: Int) {
        addLabel("Since age", to: view, y: y)
        let field = NSTextField(frame: NSRect(x: 164, y: y, width: 80, height: 30))
        field.stringValue = String(Int(profile.moveAge))
        field.target = self
        field.action = #selector(moveAgeChanged(_:))
        view.addSubview(field)
    }

    private func addFactorRow(to view: NSView, label: String, key: String, y: Int) {
        addLabel(label, to: view, y: y)
        let popup = NSPopUpButton(frame: NSRect(x: 164, y: y, width: 230, height: 28), pullsDown: false)
        let options = factorOptions[key] ?? []
        for option in options {
            popup.addItem(withTitle: option.label)
            popup.lastItem?.representedObject = option.value
        }
        let selected = profile.factors[key] ?? "skip"
        if let option = options.first(where: { $0.value == selected }) {
            popup.selectItem(withTitle: option.label)
        }
        popup.identifier = NSUserInterfaceItemIdentifier(key)
        popup.target = self
        popup.action = #selector(factorChanged(_:))
        view.addSubview(popup)
    }

    @objc private func birthDateChanged(_ sender: NSDatePicker) {
        profile.birthDate = sender.dateValue
        saveProfile()
        update()
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
        update()
    }

    @objc private func moveAgeChanged(_ sender: NSTextField) {
        profile.moveAge = clamp(Double(sender.stringValue) ?? 0, 0, 110)
        sender.stringValue = String(Int(profile.moveAge))
        saveProfile()
        update()
    }

    @objc private func factorChanged(_ sender: NSPopUpButton) {
        guard let key = sender.identifier?.rawValue,
              let value = sender.selectedItem?.representedObject as? String else { return }
        profile.factors[key] = value
        saveProfile()
        update()
    }
}

let app = NSApplication.shared
let delegate = MementoApp()
app.delegate = delegate
app.run()
