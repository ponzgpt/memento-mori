import importlib.util
import json
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WAYBAR_PATH = ROOT / "waybar" / "memento.py"

spec = importlib.util.spec_from_file_location("memento_waybar", WAYBAR_PATH)
memento = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = memento
spec.loader.exec_module(memento)


class WaybarEmitterTest(unittest.TestCase):
    def test_payload_contract_uses_full_seconds(self):
        config = {
            "birth_date": "1992-06-19",
            "life_expectancy_years": 73.4804,
            "skin": "system-dark",
        }
        now = datetime(2026, 6, 19, 9, 0, tzinfo=timezone.utc)

        payload = memento.payload(config, memento.calculate(config, now))

        self.assertRegex(payload["text"], r"^\d+y \d+d \d+h \d+m \d+s$")
        self.assertEqual(payload["class"][0], "memento-mori")
        self.assertIn("skin-system-dark", payload["class"])
        self.assertIsInstance(payload["percentage"], int)
        self.assertIn("Death date:", payload["tooltip"])
        self.assertIn("mental-health advice", payload["tooltip"])

    def test_sample_config_is_current_shape(self):
        sample = memento.sample_config()

        self.assertEqual(sample["schema"], "memento-mori.profile.v1")
        self.assertNotIn("mode", sample)
        self.assertNotIn("display", sample)
        self.assertEqual(sample["skin"], "system-light")
        self.assertIn("mental-health advice", sample["disclaimer"])

    def test_cli_sample_config_is_valid_json(self):
        sample_json = json.dumps(memento.sample_config())

        self.assertEqual(json.loads(sample_json)["birth_date"], "1992-06-19")


if __name__ == "__main__":
    unittest.main()
