import os

import pandas as pd

from app.ml.predict import predict_demand


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


def load_data():
    df = pd.read_csv(DATA_PATH)

    df["Date"] = pd.to_datetime(
        df["Date"],
        errors="coerce",
    )

    df = df.dropna(
        subset=[
            "Date",
            "State",
            "Max_Demand_Met_MW",
        ]
    )

    df = df.sort_values(
        ["State", "Date"]
    ).reset_index(drop=True)

    # Calculate previous-day demand
    df["Lag_1_Demand"] = (
        df.groupby("State")["Max_Demand_Met_MW"]
        .shift(1)
    )

    # Calculate demand from 7 days earlier
    df["Lag_7_Demand"] = (
        df.groupby("State")["Max_Demand_Met_MW"]
        .shift(7)
    )

    return df


def run_weather_scenario(
    state,
    current_temperature,
    scenario_temperature,
    humidity,
    rainfall,
):
    df = load_data()

    # --------------------------------------------------
    # Find the selected state
    # --------------------------------------------------

    state_df = df[
        df["State"] == state
    ].copy()

    if state_df.empty:
        raise ValueError(
            f"No data found for state: {state}"
        )

    # --------------------------------------------------
    # Use the latest available date in the dataset
    # --------------------------------------------------

    state_df = state_df.sort_values(
        "Date"
    )

    row = state_df.iloc[-1]

    latest_date = row["Date"]

    # --------------------------------------------------
    # Make sure lag demand values are available
    # --------------------------------------------------

    if pd.isna(row["Lag_1_Demand"]) or pd.isna(
        row["Lag_7_Demand"]
    ):
        raise ValueError(
            "Lag demand values are not available "
            "for the latest date."
        )

    # --------------------------------------------------
    # Common prediction features
    # --------------------------------------------------

    common_features = {
        "state": state,
        "humidity": humidity,
        "rainfall": rainfall,
        "month": int(row["Month"]),
        "weekday": row["Weekday"],
        "season": row["Season"],
        "lag_1_demand": float(
            row["Lag_1_Demand"]
        ),
        "lag_7_demand": float(
            row["Lag_7_Demand"]
        ),
    }

    # --------------------------------------------------
    # Baseline prediction
    # --------------------------------------------------

    baseline_result = predict_demand(
        temp_avg=current_temperature,
        **common_features,
    )

    # --------------------------------------------------
    # Scenario prediction
    # --------------------------------------------------

    scenario_result = predict_demand(
        temp_avg=scenario_temperature,
        **common_features,
    )

    baseline_demand = baseline_result[
        "predicted_demand"
    ]

    scenario_demand = scenario_result[
        "predicted_demand"
    ]

    # --------------------------------------------------
    # Calculate difference
    # --------------------------------------------------

    difference = (
        scenario_demand - baseline_demand
    )

    # --------------------------------------------------
    # Calculate percentage change
    # --------------------------------------------------

    if baseline_demand != 0:
        percentage_change = (
            difference / baseline_demand
        ) * 100
    else:
        percentage_change = 0

    # --------------------------------------------------
    # Return API response
    # --------------------------------------------------

    return {
        "baselineDemand": round(
            baseline_demand,
            2,
        ),
        "scenarioDemand": round(
            scenario_demand,
            2,
        ),
        "difference": round(
            difference,
            2,
        ),
        "percentageChange": round(
            percentage_change,
            2,
        ),
    }