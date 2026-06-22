# Apple Platform Plan

Date checked: 2026-06-19.

## Product Direction

Apple surfaces should feel native, quiet, and glanceable:

- macOS menu-bar app
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
5. Add a dedicated macOS menu-bar shell if the iOS-on-Mac path cannot deliver the right controls.

## Design Rules

- Widgets must be glanceable: `MM`, countdown, and integrated progress only.
- The setup panel is a single page: birth date, birth country, living country, since age, and checkbox rows.
- Reflection popups show only the phrase.
- Built-in skins stay limited to `system-light` and `system-dark`.
- OS bars and contextual menus should match the selected skin while preserving platform-specific shapes and workflows.
- Contextual menus expose one palette toggle: bone and ash with a minimal skull icon, and onyx with a minimal half-burnt candle icon.
- Logo imagery should avoid skull-and-crossbones. Use a quiet bone-hourglass emblem inspired by classical memento mori motifs such as hourglasses, candles, books, still-life skull studies, and wilting flowers.
- Cross-platform previews should cover Linux, Windows, macOS, iOS app icon, and iOS widgets.
