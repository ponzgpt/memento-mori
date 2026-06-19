# Apple Platform Plan

Date checked: 2026-06-19.

## Product Direction

Memento Mori should treat the local browser preview as a component workbench only. The product surfaces are:

- Linux status-bar module.
- macOS menu-bar app and widgets.
- Windows taskbar/tray app.
- iOS app and WidgetKit widgets.

The Apple direction matters because iOS widgets and Apple silicon Mac availability make one Apple-first implementation useful across a large audience. The design should stay closer to Apple defaults than to a web landing page: system typography, restrained contrast, generous spacing where the surface allows it, and glanceable widgets.

## Apple Sources

- Apple WidgetKit documentation: https://developer.apple.com/documentation/widgetkit
- Apple Human Interface Guidelines for widgets: https://developer.apple.com/design/human-interface-guidelines/widgets/
- Apple guidance for running iOS apps in macOS: https://developer.apple.com/documentation/apple-silicon/running-your-ios-apps-in-macos
- App Store Connect availability for iPhone and iPad apps on Apple silicon Macs: https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-of-iphone-and-ipad-apps-on-macs-with-apple-silicon/
- Memento mori art reference: https://dailystoic.com/history-of-memento-mori-art/

## V1 Native Roadmap

1. Keep the shared calculation model small and portable.
2. Build the iOS app in SwiftUI with WidgetKit widgets for the countdown surface.
3. Make the iOS app available on Apple silicon Macs through App Store Connect where it works well.
4. Add a dedicated macOS shell later if the menu-bar/status-bar experience needs native Mac controls beyond the iOS app-on-Mac path.
5. Keep the component workbench as a fast Codex iteration board for visual review, not as a shipping webpage.

## Design Rules

- Widgets must be glanceable: `MM`, countdown, and integrated progress only.
- The setup panel is a single page: birth date, birth country, living country, since age, and checkbox rows.
- Reflection popups show only the phrase.
- Built-in skins stay limited to `system-light` and `system-dark`.
- OS bars and contextual menus should match the selected skin while preserving platform-specific shapes and menu workflows.
- Contextual menus expose one palette toggle: bone and ash with a minimal skull icon, and onyx with a minimal half-burnt candle icon.
- Logo imagery should avoid skull-and-crossbones. Use a quiet bone-hourglass emblem inspired by classical memento mori motifs such as hourglasses, candles, books, still-life skull studies, and wilting flowers.
- Cross-platform app previews should cover Linux, Windows, macOS, iOS app icon, and iOS widgets in the same component workbench.
