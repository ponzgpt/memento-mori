# Apple Platform Plan

Date checked: 2026-06-19.

## Product Direction

Apple surfaces should feel native, quiet, and glanceable:

- macOS menu-bar app: source-installable through the Swift/AppKit app in `native/macos/`
- iOS app
- iOS Lock Screen and Home Screen widgets
- Apple silicon Mac availability where the iOS app behaves well

The Apple version should follow the same product discipline as the Linux widget: `MM`, countdown, progress, one setup panel, and no fake wellness fog machine.

## Apple Sources

- Apple WidgetKit documentation: https://developer.apple.com/documentation/widgetkit
- Apple Human Interface Guidelines for widgets: https://developer.apple.com/design/human-interface-guidelines/widgets/
- Apple guidance for running iOS apps in macOS: https://developer.apple.com/documentation/apple-silicon/running-your-ios-apps-in-macos
- App Store Connect availability for iPhone and iPad apps on Apple silicon Macs: https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-of-iphone-and-ipad-apps-on-macs-with-apple-silicon/
- Memento mori art reference: https://dailystoic.com/history-of-memento-mori-art/

## Native Roadmap

1. Keep the shared calculation model small and portable.
2. Build the iOS app in SwiftUI.
3. Add WidgetKit countdown widgets.
4. Make the iOS app available on Apple silicon Macs where it works well.
5. Keep the dedicated macOS menu-bar shell aligned with the iOS widgets if the iOS-on-Mac path cannot deliver the right controls.

## Design Rules

These follow the shipped macOS menu-bar app (`native/macos/MementoMoriMenuBar.swift`); the iOS app should carry the same rules over to WidgetKit, not invent its own.

- Widgets must be glanceable: the skull glyph plus a countdown, with percent and death date as opt-in additions — see Display below.
- No separate settings window. Every control (profile, lifestyle, display toggles) lives inside the same contextual menu the countdown appears in.
- The menu bar reads as one sentence: fecha de nacimiento, país de nacimiento, país de residencia, y desde qué edad — not four unrelated settings.
- Reflection quotes shown on menu open are text only, no ornamentation.
- No skin or palette selector. One emblem, tinted automatically by the OS's own light/dark appearance (`NSImage.isTemplate`), not chosen by the user.
- The emblem is a minimal skull: cranium, jaw, eye sockets, nose, one tooth notch — no skull-and-crossbones, no candle, no hourglass icon. The canonical geometry lives in `native/macos/MementoMoriMenuBar.swift` (`skullImage`) and is mirrored in `assets/skull.svg` for other platforms' exports.
- Display is user-controlled per unit: days, hours, minutes, seconds, percent elapsed, and death date each toggle independently in the bar; the open menu always shows all of them regardless of the toggles, since toggles govern the bar only.
- Cross-platform previews should cover Linux, Windows, macOS, iOS app icon, and iOS widgets, all rendering the same skull glyph.
