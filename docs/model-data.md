# Model Data

This file lists the deterministic values used by the local calculation model, shared by the web app and the native widget.

The values are intentionally small enough to audit by reading the source. They are not a clinical model, an actuarial model, an insurance score, or medical advice.

## Population Baselines

Source note used by the app: World Bank WDI `SP.DYN.LE00.IN`, 2024 values, API last updated 2026-04-08. Life expectancy at birth is a population-period statistic, not an individual prediction.

| Code | Label | Years | Source year |
| --- | --- | ---: | ---: |
| WLD | World average | 73.480380292779 | 2024 |
| USA | United States | 78.890243902439 | 2024 |
| GBR | United Kingdom | 81.3868536585366 | 2024 |
| DEU | Germany | 80.7926829268293 | 2024 |
| ESP | Spain | 83.8878048780488 | 2024 |
| JPN | Japan | 84.0363414634146 | 2024 |
| IND | India | 72.235 | 2024 |
| BRA | Brazil | 76.023 | 2024 |

Unknown country codes fall back to `WLD`.

## Residence Blend

The profile separates birth country and current country. When the user moved after birth, the model blends from origin baseline toward residence baseline:

```text
years_since_move = max(0, current_age - move_age)
migration_weight = clamp(years_since_move / 20, 0, 0.65)
baseline_years = origin_years + (residence_years - origin_years) * migration_weight
```

If the current residence is the same as the birth country, the move age is invalid, the move age is zero, or the move age is greater than the current age, the origin baseline is used without migration blending.

## Local Offsets

Every factor requires a real answer -- there is no "skip" or neutral option, in the web app or the widget. First-run defaults are marked below; they are the typical answer on each scale, not necessarily the best one.

| Row | Value | Years | Label | Default |
| --- | --- | ---: | --- | :---: |
| sex | male | -2.4 | Male life tables tend to run lower | ✓ |
| sex | female | 3.1 | Female life tables tend to run higher | |
| sleep | stable | 1 | Stable sleep adjustment | ✓ |
| sleep | irregular | -1.2 | Irregular sleep adjustment | |
| exercise | sedentary | -2.5 | Sedentary exercise adjustment | |
| exercise | light | -0.6 | Light exercise adjustment | |
| exercise | moderate | 0.8 | Moderate exercise adjustment | ✓ |
| exercise | regular | 2.0 | Regular exercise adjustment | |
| exercise | athletic | 3.4 | Athletic exercise adjustment | |
| drinking | none | 0.6 | No alcohol adjustment | |
| drinking | light | 0.3 | Light alcohol adjustment | ✓ |
| drinking | moderate | -0.9 | Moderate alcohol adjustment | |
| drinking | frequent | -2.1 | Frequent alcohol adjustment | |
| drinking | heavy | -3.8 | Heavy alcohol adjustment | |
| smoking | never | 1.2 | Never smoked adjustment | ✓ |
| smoking | former | 0.4 | Former smoker adjustment | |
| smoking | occasional | -1.6 | Occasional smoking adjustment | |
| smoking | regular | -3.3 | Regular smoking adjustment | |
| smoking | heavy | -5.6 | Heavy smoking adjustment | |
| health | none | 1 | No known managed condition adjustment | ✓ |
| health | managed | -1 | Managed condition adjustment | |
| health | serious | -4 | Serious condition adjustment | |

These values are identical in `app/memento-core.js` (`CUSTOM_OFFSETS`) and `native/macos/MementoMoriMenuBar.swift` (`factorOptions`) -- the two implementations are kept numerically in sync by hand, checked by `tests/memento-core.test.mjs` on the web side.

## Clamp

Final life expectancy is clamped to the range `45` to `105` years.

```text
life_expectancy_years = clamp(baseline_years + local_offsets, 45, 105)
```

The clamp prevents absurd output from coarse inputs. It is not a hidden confidence interval.
