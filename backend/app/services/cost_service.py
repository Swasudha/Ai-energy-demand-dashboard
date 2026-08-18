import os

import pandas as pd


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "..",
    "data",
    "raw",
    "PSP_Weather_Merged_EDA_Cleaned.csv",
)

TARIFF_PATH = os.path.join(
    BASE_DIR,
    "..",
    "data",
    "reference",
    "state_tariffs.csv",
)


def load_tariffs():
    return pd.read_csv(TARIFF_PATH)


def get_state_tariff(state):
    tariffs = load_tariffs()

    tariff_row = tariffs[
        tariffs["state"].str.lower() == state.lower()
    ]

    if tariff_row.empty:
        raise ValueError(
            f"No tariff found for state: {state}"
        )

    return float(
        tariff_row.iloc[0]["tariff_rs_per_kwh"]
    )


def calculate_cost(energy_mu, state):
    tariff = get_state_tariff(state)

    estimated_cost = (
        energy_mu
        * 1_000_000
        * tariff
    )

    return {
        "state": state,
        "energyMU": round(
            float(energy_mu),
            2,
        ),
        "tariffRsPerKWh": round(
            tariff,
            2,
        ),
        "estimatedCost": float(
            round(
                estimated_cost,
                2,
            )
        ),
    }


def calculate_state_cost(state):
    df = pd.read_csv(DATA_PATH)

    state_df = df[
        df["State"].str.lower() == state.lower()
    ]

    if state_df.empty:
        raise ValueError(
            f"No demand data found for state: {state}"
        )

    total_energy_mu = state_df[
        "Energy_Met_MU"
    ].sum()

    return calculate_cost(
        total_energy_mu,
        state,
    )