# Calculation Model

Data snapshot: World Bank WDI 2024 values included in the repository.

## Purpose

The model supplies perspective, not prognosis. It translates a public population statistic into a central date and deliberately surrounds it with a broad range.

## Formula

The web app and the native widget run the same model -- see [product-requirements.md](product-requirements.md) for why that pairing exists and how the two implementations are kept in sync.

```text
baseline_years   = birth_country_years blended toward current_country_years,
                    weighted by years since the age moved (see model-data.md)
local_offset     = sum of the six lifestyle-factor adjustments
life_expectancy  = clamp(baseline_years + local_offset, 45, 105)

central_horizon = birth_date + life_expectancy
range_start     = central_horizon - 7 years
range_end       = central_horizon + 7 years
progress        = age_now / life_expectancy
```

Remaining years, weeks, and days are alternative presentations of the same central horizon. They are not separate forecasts. Exact baseline and offset values are listed in [model-data.md](model-data.md).

## Source

The included baselines use World Bank World Development Indicators series `SP.DYN.LE00.IN`, life expectancy at birth, with 2024 values for the world and seven country references. Exact stored values are listed in [model-data.md](model-data.md).

Life expectancy at birth is a population-period statistic. It does not account for an individual's health, family history, local conditions, future events, or medical care. The source therefore supports a reflective reference but cannot support an individual death prediction.

## Input validation

The web flow requires:

- a real calendar date in `YYYY-MM-DD` form;
- a date that is not in the future;
- an age no greater than 120 years;
- a country code present in the bundled baseline table for both birth and current country;
- a real answer for each of the six lifestyle factors -- there is no "skip", on the web or in the widget; see the next section for why.

An invalid input produces no result and displays an inline announced error.

## Why the lifestyle factors exist, and why there is no "skip"

An earlier version of the web app set every lifestyle offset to a no-op "skip", on the reasoning that a coarse adjustment risked false authority. That decision only ever applied to the web: the native widget always asked for a real answer to all six factors, because letting someone dodge the question doesn't make the estimate more honest, it just quietly reverts to whichever answer skip happens to encode. The web app now asks the same six questions the widget does, with the same values, so that a visitor gets the same number in the browser as they would after installing it -- see [model-data.md](model-data.md) for the exact table, and [product-requirements.md](product-requirements.md) for why the two surfaces are required to stay in sync.

## Range choice

The seven-year margin is a product communication boundary, not a confidence interval. Its job is to keep uncertainty visible and prevent a central date from looking exact. It does not make the estimate medically or actuarially valid.

## Boundaries

Memento Mori does not provide diagnosis, clinical risk scoring, insurance or actuarial scoring, legal advice, mental-health advice, or remote profile storage.
