# Calculation Model

Data checked: 2026-06-19.

## Functional Model

Memento Mori estimates a deterministic target date from:

```text
birth date + country life expectancy + local checkbox offsets
```

The output is a countdown, not a prediction. The widget keeps the model local, transparent, and intentionally coarse.

## Data Source

The default population baseline uses World Bank WDI indicator `SP.DYN.LE00.IN`, 2024 life expectancy at birth values.

Life expectancy at birth is a population-period statistic. It does not know the user, their doctor, their family, their city, their luck, or what they did last weekend. The app labels the estimate as approximate because anything else would be numerology with nicer typography.

## Country Context

The profile separates:

- birth country
- current country
- age since moving

If birth country and current country differ, the model blends toward the current country after the entered move age. This gives migration context without pretending to model neighborhood-level effects, health-care access, or city-specific mortality differences.

## Local Offsets

The live settings panel includes six checkbox rows:

- sex
- sleep
- exercise
- drinking
- smoking
- health context

Each row is mutually exclusive. Unselected rows are skipped internally. Selected rows apply fixed local offsets to the population baseline.

These offsets are not clinical calculations. They are a small reflective adjustment so the widget does not feel completely generic.

## Boundaries

Memento Mori does not provide:

- diagnosis
- clinical risk scoring
- actuarial or insurance scoring
- mental-health advice
- legal advice
- remote profile storage
- runtime network calls for the countdown

The model should remain auditable. If a future platform shell needs more code, the calculation core should stay small enough to inspect without needing a second life.
