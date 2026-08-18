import pandas as pd
from pathlib import Path


TARIFF_FILE = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "reference"
    / "state_tariffs.csv"
)


def load_tariffs():
    return pd.read_csv(TARIFF_FILE)