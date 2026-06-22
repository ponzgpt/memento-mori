# Privacy

Memento Mori is designed as a local-first widget. The countdown should not require an account, analytics, telemetry, cloud sync, or a runtime network service.

## Data Used

The app can use:

- birth date
- birth country
- current country
- age when current residence began
- coarse lifestyle rows for sex, sleep, exercise, drinking, smoking, and health context
- selected palette and local display preferences

These values are used to calculate an approximate countdown on the device. They are personal enough to deserve boring, conservative handling.

## Local Storage

The profile is stored locally:

- Linux Waybar source install: `~/.config/memento-mori/config.json`
- macOS source install: `~/Library/Application Support/Memento Mori`
- Windows source install: `%LOCALAPPDATA%\MementoMori`
- local component app: browser local storage for the page served from `127.0.0.1`

The project should not transmit profile values to a server for countdown calculation.

## Network

The countdown model does not need network access at runtime. Documentation links, GitHub Releases, Stripe checkout, and newsletter pages are separate distribution or documentation surfaces, not part of the local countdown calculation.

## Deletion

Delete the local profile paths above to remove saved data. For the local component app, clear site data for `http://127.0.0.1:4173` in the browser used to open it.

## Reports

Do not include birth dates, diagnoses, medical documents, private health history, or secrets in public issues. Keep reports technical: operating system, install path, bar or shell, expected behavior, actual behavior, and relevant terminal output.

## Limits

The estimate is approximate and reflective. It is not medical, legal, actuarial, insurance, or mental-health advice.

Paid convenience installers, when available, may use Stripe or a product website for purchase and download delivery. That payment flow is separate from the local countdown profile.
