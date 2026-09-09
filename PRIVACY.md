# Privacy

Memento Mori -- the native widget and this web demo alike -- is local-first. Producing a perspective does not require an account, analytics, telemetry, advertising, cloud sync, or a runtime API.

## Data used by the web app

- Birth date.
- Country of birth and, if different, current country of residence and the age you moved.
- Six lifestyle factors: sex, sleep, exercise, drinking, smoking, and health -- the same six the native widget asks for, with the same values (see `docs/model-data.md`).
- A short daily intention, when the visitor chooses to write one.
- Whether that intention is marked complete.

None of this leaves the browser: the calculation runs client-side and nothing above is sent to a server, an analytics tool, or a third party. The web flow does not request medical history, diagnosis, precise location, name, email, or payment information.

## Where data lives

The calculation runs in JavaScript inside the browser. Two versioned local-storage records are used:

- `memento-mori.web-profile.v2`
- `memento-mori.daily-intention.v1`

They remain in the current browser profile on the current device. nginx serves static files but does not receive the entered values. The app contains no analytics or third-party runtime scripts.

If local storage is blocked or unavailable, the calculation continues to work for the current page session and the interface reports that persistence is unavailable.

## Deletion

The "Delete my data" action ("Borrar mis datos" in Spanish) removes both records after confirmation. Clearing site data for `memento.technoir.cloud` in the browser removes them as well.

The native widget is a separate installation with its own local storage (macOS `UserDefaults`, a local config file for Waybar) -- deleting the web app's browser data does not touch it. Each platform's uninstall path is documented in `docs/install.md`.

## Copying and reports

The copy action creates a neutral horizon summary and deliberately excludes the birth date. Do not put birth dates, health records, credentials, or private personal history in public issue reports.

## Limits

The estimate is approximate and reflective. It is not an individual prediction and is not medical, legal, actuarial, insurance, or mental-health advice.
