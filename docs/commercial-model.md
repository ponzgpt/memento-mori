# Commercial Model

Memento Mori should use a source-available commercial convenience model:

- Source code stays on GitHub under Apache-2.0.
- Technical users get a one-command install from source.
- Non-technical users can buy a cheap signed installer for convenience.
- Payment should run through Stripe from a personal website and beehiiv newsletter funnel.
- No support entitlement is included. The software is provided as-is.
- Community PRs are welcome when useful.
- Forks are explicitly acceptable.

This mirrors the practical split used by tools such as Chris Titus Tech's Windows utility: free source for technical users, paid convenience for people who value time and packaging.

## Paid Installer Boundary

The paid installer should only package and simplify:

- Signed desktop builds.
- Default config placement.
- Status-bar/tray registration.
- Uninstall flow.
- Basic update checks if wanted later.

It should not hide the core calculation, skins, or Waybar emitter behind payment.

## Free Technical Path

Free path remains:

- GitHub clone.
- `./install.sh`.
- Manual Waybar examples.
- Local config files.

## Product Copy Boundary

Use direct language:

- Pay for the convenience installer, not support.
- No medical, legal, actuarial, insurance, or mental-health advice.
- No warranty.
- Maintained as the author sees fit.
- PRs may be accepted, but there is no service-level promise.
