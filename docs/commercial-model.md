# Commercial Model

## Positioning

Memento Mori uses an open-source plus convenience-installer model:

- Source code stays on GitHub under Apache-2.0.
- Technical users get a direct source install path.
- Non-technical users can buy a low-cost signed installer or executable for convenience.
- The paid version does not hide core functionality. It saves setup time, which is a respectable thing to sell to people with a countdown in their tray.

This keeps the project credible with Linux and open-source users while making the product approachable for people who do not want to clone a repository, edit a bar config, or discover what `$PATH` thinks of them today.

## Offers

### Free Source

- Public GitHub repository.
- Source install for Linux:

```sh
git clone https://github.com/ponzgpt/memento-mori.git
cd memento-mori
./install.sh
```

- Manual Waybar examples.
- Apache-2.0 license.
- No warranty beyond the license.
- Community pull requests are welcome when they fit the product direction.
- Anyone can fork the code and maintain a variant.

### Paid Convenience

- Cheap downloadable installer.
- Target price: low impulse purchase, roughly USD 5-15.
- Payment processor: Stripe.
- Sales channels: personal website and beehiiv newsletter.
- Signed builds where practical:
  - Linux AppImage, native package, or archive.
  - macOS `.dmg` or `.pkg`.
  - Windows `.exe` or `.msi`.
- Includes defaults, launcher, uninstall path, and setup wizard.
- Same core source remains visible on GitHub.
- No support entitlement. The paid value is installer convenience.

Signed/native packaging requirements are tracked in [native-packaging.md](native-packaging.md). Until those checks are complete, convenience artifacts should be described as source-installable or unsigned.

## Release Practice

1. Tag releases with SemVer.
2. Attach source archives and platform artifacts to GitHub Releases.
3. Keep checks green before publishing: audit, lint, unit tests, Waybar smoke test.
4. Preserve Apache-2.0 notices in every packaged artifact.
5. Route paid downloads through Stripe Checkout when charging for convenience builds.
6. Keep release notes short, factual, and explicit about platform support.

## License Notes

Apache-2.0 permits commercial use and redistribution, provided license terms and notices are preserved.

Do not sell medical, actuarial, insurance, mental-health, or legal accuracy. The commercial promise is install convenience and polish. The software is provided as-is.
