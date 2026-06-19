# Commercial Model

## Positioning

Memento Mori should use a source-available commercial convenience model:

- Source code stays on GitHub under Apache-2.0.
- Technical users get a one-command install path from the repository.
- Non-technical users can buy a cheap signed installer/executable for convenience and automatic setup.

This keeps the product credible with the Arch/Linux audience while still creating a simple paid offer for users who do not want to build, clone, configure Waybar, or manage platform quirks.

## Offers

### Free / Technical

- GitHub repository.
- One-command install:

```sh
curl -fsSL https://example.com/memento-mori/install.sh | sh
```

- Manual Waybar examples.
- No warranty beyond the open-source license.
- Community pull requests are welcome when they fit the project direction.
- Anyone can fork the code and maintain their own variant.

### Paid / Convenience

- Cheap downloadable installer.
- Target price: low impulse purchase, roughly USD 5-15.
- Payment processor: Stripe.
- Sales channels: personal website and beehiiv newsletter.
- Signed builds where practical:
  - Linux AppImage or native packages later.
  - macOS `.dmg` or `.pkg` later.
  - Windows `.exe` or `.msi` later.
- Includes defaults, launcher, uninstall path, and setup wizard.
- Same core source remains visible on GitHub.
- No support entitlement. The paid value is installer convenience.

## Practical Packaging Path

1. Keep the current Waybar script and static setup UI as the free technical MVP.
2. Add a Tauri shell for cross-platform desktop packaging.
3. Publish GitHub releases with source archives and technical artifacts.
4. Sell signed convenience installers through Stripe Checkout on the personal website.
5. Promote releases through the beehiiv newsletter.
6. Keep the paid value focused on convenience and trust, not hidden features.

## License Notes

Apache-2.0 permits commercial use and redistribution. The paid installer can distribute the same Apache-2.0 code, provided license terms and notices are preserved.

Avoid promising medical, actuarial, insurance, mental-health, or legal accuracy in paid copy. The commercial promise is install convenience and polish. The software is provided as-is.
