# Memento Mori v1 Research Notes

Research timestamp: 2026-06-19T10:07:29+0100.

## Product Position

Memento Mori starts as a Waybar custom module for Arch Linux, Hyprland, and other wlroots-based Wayland desktops. The MVP includes a static setup UI and a Python emitter that outputs Waybar-compatible JSON. The cross-platform path is to wrap the same HTML/CSS/JS setup UI in Tauri for Linux, macOS, and Windows while keeping the Waybar script as the Linux-first integration.

## Platform Findings

- Hyprland documents Waybar as a GTK status bar for wlroots compositors with Hyprland support and recommends distro package installation.
- Waybar custom modules support `interval`, click handlers, tooltips, `return-type: "json"`, and JSON fields including `text`, `tooltip`, `class`, and `percentage`.
- Waybar CSS can target `#custom-<name>` and classes supplied by the module script, which is enough for native blending and user-defined skins.
- Tauri 2 positions itself as frontend-independent and cross-platform across Linux, macOS, and Windows, making it a reasonable later wrapper for the same setup UI.

## Mortality Model Boundaries

- The default deterministic model uses World Bank WDI `SP.DYN.LE00.IN` 2024 life expectancy at birth values.
- The World Bank definition is a population-level period life-table measure and does not predict an individual lifespan.
- WHO notes recent global life expectancy disruption from COVID-era mortality changes, so v1 labels the estimate as approximate and source-dated.
- OECD similarly defines life expectancy at birth as an average assuming age-specific mortality levels remain constant and notes actual cohort death rates are not known in advance.

## V1.8 Scope

- Live settings panel: birth date, birth country, current country, and age since moving.
- Live model: six coarse checkbox rows for sex, sleep, exercise, drinking, smoking, and health context; editing any field recalculates immediately.
- No quickstart/custom split and no restart action in the visible UX.
- Skins: `system-light` uses a bone/ash palette with ashy grey accent; `system-dark` uses an onyx palette with gold contrast; CSS hooks remain for technical users.
- Output: Python Waybar module emitter, setup UI, and user-facing bar previews for Linux, macOS, and Windows.

## Explicit Non-Scope

- No clinical risk model, medical personalization, insurance/actuarial scoring, or diagnosis.
- No collection of sensitive medical data beyond local form choices.
- No remote runtime API calls in the widget.
