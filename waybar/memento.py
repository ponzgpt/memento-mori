#!/usr/bin/env python3
"""Waybar JSON emitter for Memento Mori."""

from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

SECONDS_PER_YEAR = 365.2425 * 24 * 60 * 60
DEFAULT_CONFIG = Path("~/.config/memento-mori/config.json").expanduser()
DEFAULT_LIFE_EXPECTANCY_YEARS = 73.4804


@dataclass
class Countdown:
    remaining_seconds: int
    progress: int
    state: str
    target: datetime


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Emit Memento Mori countdown JSON for Waybar.")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG, help="Path to profile JSON.")
    parser.add_argument("--sample-config", action="store_true", help="Print an example profile JSON.")
    return parser.parse_args()


def sample_config() -> dict:
    return {
        "schema": "memento-mori.profile.v1",
        "birth_date": "1992-06-19",
        "life_expectancy_years": DEFAULT_LIFE_EXPECTANCY_YEARS,
        "skin": "system-light",
        "disclaimer": "Approximation only. Not medical, legal, actuarial, or insurance advice.",
    }


def load_config(path: Path) -> dict:
    if not path.exists():
        return sample_config()
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def parse_birth_date(value: str) -> datetime:
    return datetime.fromisoformat(value).replace(tzinfo=timezone.utc)


def calculate(config: dict, now: datetime | None = None) -> Countdown:
    now = now or datetime.now(timezone.utc)
    birth = parse_birth_date(config["birth_date"])
    years = float(config.get("life_expectancy_years", DEFAULT_LIFE_EXPECTANCY_YEARS))
    target_ts = birth.timestamp() + years * SECONDS_PER_YEAR
    target = datetime.fromtimestamp(target_ts, tz=timezone.utc)
    remaining = int(target.timestamp() - now.timestamp())
    lived = max(0, now.timestamp() - birth.timestamp())
    total = max(1, years * SECONDS_PER_YEAR)
    progress = min(100, max(0, round((lived / total) * 100)))

    if remaining < 0:
        state = "borrowed"
    elif progress >= 88:
        state = "near"
    elif progress >= 66:
        state = "finite"
    else:
        state = "calm"

    return Countdown(remaining, progress, state, target)


def split_duration(seconds: int) -> tuple[int, int, int, int, int]:
    seconds = abs(seconds)
    years = math.floor(seconds / SECONDS_PER_YEAR)
    seconds -= math.floor(years * SECONDS_PER_YEAR)
    days, seconds = divmod(seconds, 86400)
    hours, seconds = divmod(seconds, 3600)
    minutes, seconds = divmod(seconds, 60)
    return years, days, hours, minutes, seconds


def format_duration(seconds: int) -> str:
    prefix = "+" if seconds < 0 else ""
    years, days, hours, minutes, sec = split_duration(seconds)
    return f"{prefix}{years}y {days}d {hours}h {minutes}m {sec}s"


def payload(config: dict, countdown: Countdown) -> dict:
    skin = config.get("skin", "system-light")
    text = format_duration(countdown.remaining_seconds)
    tooltip = "\n".join(
        [
            f"Memento Mori: {format_duration(countdown.remaining_seconds)} remaining",
            f"Death date: {countdown.target.date().isoformat()}",
            "Approximation only. Not medical, legal, actuarial, or insurance advice.",
        ]
    )
    return {
        "text": text,
        "tooltip": tooltip,
        "class": ["memento-mori", f"skin-{skin}", countdown.state],
        "percentage": countdown.progress,
    }


def main() -> int:
    args = parse_args()

    if args.sample_config:
        print(json.dumps(sample_config(), indent=2))
        return 0

    config = load_config(args.config.expanduser())
    print(json.dumps(payload(config, calculate(config)), separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
