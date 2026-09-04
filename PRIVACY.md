# Privacy

Memento Mori is a local-first web app. Producing a perspective does not require an account, analytics, telemetry, advertising, cloud sync, or a runtime API.

## Data used by the web app

- Birth date.
- Country reference.
- A short daily intention, when the visitor chooses to write one.
- Whether that intention is marked complete.

The web flow does not request medical history, diagnosis, sex, smoking, alcohol, sleep, exercise, precise location, name, email, or payment information.

## Where data lives

The calculation runs in JavaScript inside the browser. Two versioned local-storage records are used:

- `memento-mori.web-profile.v2`
- `memento-mori.daily-intention.v1`

They remain in the current browser profile on the current device. nginx serves static files but does not receive the entered values. The app contains no analytics or third-party runtime scripts.

If local storage is blocked or unavailable, the calculation continues to work for the current page session and the interface reports that persistence is unavailable.

## Deletion

The “Borrar mis datos” action removes both records after confirmation. Clearing site data for `memento.technoir.cloud` in the browser removes them as well.

The retained experimental native companions use their documented device-local configuration paths; they are not part of the final web flow.

## Copying and reports

The copy action creates a neutral horizon summary and deliberately excludes the birth date. Do not put birth dates, health records, credentials, or private personal history in public issue reports.

## Limits

The estimate is approximate and reflective. It is not an individual prediction and is not medical, legal, actuarial, insurance, or mental-health advice.
