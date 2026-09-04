# Calculation Model

Data snapshot: World Bank WDI 2024 values included in the repository.

## Purpose

The model supplies perspective, not prognosis. It translates a public population statistic into a central date and deliberately surrounds it with a broad range.

## Web formula

```text
central_horizon = birth_date + country_life_expectancy_years
range_start = central_horizon - 7 years
range_end = central_horizon + 7 years
progress = age_now / country_life_expectancy_years
```

Remaining years, weeks, and days are alternative presentations of the same central horizon. They are not separate forecasts.

## Source

The included baselines use World Bank World Development Indicators series `SP.DYN.LE00.IN`, life expectancy at birth, with 2024 values for the world and seven country references. Exact stored values are listed in [model-data.md](model-data.md).

Life expectancy at birth is a population-period statistic. It does not account for an individual's health, family history, local conditions, future events, or medical care. The source therefore supports a reflective reference but cannot support an individual death prediction.

## Input validation

The web flow requires:

- a real calendar date in `YYYY-MM-DD` form;
- a date that is not in the future;
- an age no greater than 120 years;
- a country code present in the bundled baseline table.

An invalid input produces no result and displays an inline announced error.

## Why the web flow uses no lifestyle offsets

The repository retains older native experiments that support coarse local offsets, but the public web app sets every offset to “skip.” Those adjustments were not backed by an individual clinical model and created a risk of false authority. Removing them makes the primary product simpler and more honest.

## Range choice

The seven-year margin is a product communication boundary, not a confidence interval. Its job is to keep uncertainty visible and prevent a central date from looking exact. It does not make the estimate medically or actuarially valid.

## Boundaries

Memento Mori does not provide diagnosis, clinical risk scoring, insurance or actuarial scoring, legal advice, mental-health advice, or remote profile storage.
