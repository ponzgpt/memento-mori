# Contributing

Memento Mori accepts pull requests that keep the widget small, local, and useful.

## Before Opening A PR

Run:

```sh
npm run verify
```

For smaller local loops, the same gate is composed from:

```sh
npm run audit
npm run lint
npm run check:installers
npm run check:release
npm run check:version
npm run check:web
npm test
npm run package
python3 -m py_compile waybar/memento.py
python3 waybar/memento.py --config config/profile.example.json
```

For UI changes, also run:

```sh
npm run serve
```

Then inspect `http://127.0.0.1:4173`.

## Product Rules

- Keep the tray widget compact.
- Keep the setup panel single-page and readable.
- Keep profile data local.
- Do not add accounts, analytics, cloud sync, or remote countdown APIs.
- Do not present the model as medical, actuarial, insurance, mental-health, or legal advice.
- Keep sarcasm pointed at procrastination and self-deception, not illness, age, grief, disability, or risk.

## Git Hygiene

- Use focused commits.
- Update docs and tests with behavior changes.
- Include screenshots for visual changes.
- Preserve Apache-2.0 notices.
- Avoid unrelated formatting churn.

Issues and PRs are reviewed when they fit the product direction. There is no support entitlement.
