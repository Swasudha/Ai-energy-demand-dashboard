import os

import pandas as pd

from app.ml.predict import predict_demand


# --------------------------------------------------
# PATH
# --------------------------------------------------

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


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

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

    # --------------------------------------------------
    # Calendar features
    # --------------------------------------------------

    df["Year"] = df["Date"].dt.year

    df["Month"] = df["Date"].dt.month

    df["Weekday"] = df["Date"].dt.day_name()

    # --------------------------------------------------
    # Season
    # --------------------------------------------------

    def get_season(month):

        if month in [3, 4, 5, 6]:
            return "Summer"

        if month in [7, 8, 9, 10]:
            return "Monsoon"

        return "Winter"

    df["Season"] = df["Month"].apply(
        get_season
    )

    # --------------------------------------------------
    # Previous-day demand
    # --------------------------------------------------

    df["Lag_1_Demand"] = (
        df.groupby("State")[
            "Max_Demand_Met_MW"
        ]
        .shift(1)
    )

    # --------------------------------------------------
    # Demand from 7 days earlier
    # --------------------------------------------------

    df["Lag_7_Demand"] = (
        df.groupby("State")[
            "Max_Demand_Met_MW"
        ]
        .shift(7)
    )

    return df


# --------------------------------------------------
# WEATHER SCENARIO
# --------------------------------------------------

def run_weather_scenario(
    state,
    year,
    current_temperature,
    scenario_temperature,
    humidity,
    rainfall,
):

    df = load_data()

    # --------------------------------------------------
    # Find selected state
    # --------------------------------------------------

    state_df = df[
        df["State"] == state
    ].copy()

    if state_df.empty:

        raise ValueError(
            f"No data found for state: {state}"
        )

    # --------------------------------------------------
    # Sort by date
    # --------------------------------------------------

    state_df = state_df.sort_values(
        "Date"
    )

    # Latest available record
    row = state_df.iloc[-1]

    # --------------------------------------------------
    # Validate lag values
    # --------------------------------------------------

    if (
        pd.isna(row["Lag_1_Demand"])
        or pd.isna(row["Lag_7_Demand"])
    ):

        raise ValueError(
            "Lag demand values are not available "
            "for the latest date."
        )

    # --------------------------------------------------
    # Get calendar information
    #
    # For the selected year, we keep the latest
    # available month/day pattern as the scenario
    # reference.
    # --------------------------------------------------

    month = int(row["Month"])

    weekday = row["Weekday"]

    season = row["Season"]

    # --------------------------------------------------
    # Common prediction features
    #
    # IMPORTANT:
    # Do NOT put year here because year is passed
    # explicitly to predict_demand().
    # --------------------------------------------------

    common_features = {

        "state": state,

        "humidity": float(
            humidity
        ),

        "rainfall": float(
            rainfall
        ),

        "month": month,

        "weekday": weekday,

        "season": season,

        "lag_1_demand": float(
            row["Lag_1_Demand"]
        ),

        "lag_7_demand": float(
            row["Lag_7_Demand"]
        ),
    }

    # --------------------------------------------------
    # BASELINE PREDICTION
    # --------------------------------------------------

    baseline_result = predict_demand(

        state=state,

        year=year,

        temp_avg=float(
            current_temperature
        ),

        humidity=float(
            humidity
        ),

        rainfall=float(
            rainfall
        ),

        month=month,

        weekday=weekday,

        season=season,

        lag_1_demand=float(
            row["Lag_1_Demand"]
        ),

        lag_7_demand=float(
            row["Lag_7_Demand"]
        ),
    )

    # --------------------------------------------------
    # SCENARIO PREDICTION
    # --------------------------------------------------

    scenario_result = predict_demand(

        state=state,

        year=year,

        temp_avg=float(
            scenario_temperature
        ),

        humidity=float(
            humidity
        ),

        rainfall=float(
            rainfall
        ),

        month=month,

        weekday=weekday,

        season=season,

        lag_1_demand=float(
            row["Lag_1_Demand"]
        ),

        lag_7_demand=float(
            row["Lag_7_Demand"]
        ),
    )

    # --------------------------------------------------
    # Convert prediction results to float
    # --------------------------------------------------

    baseline_demand = float(
        baseline_result
    )

    scenario_demand = float(
        scenario_result
    )

    # --------------------------------------------------
    # Calculate difference
    # --------------------------------------------------

    difference = (
        scenario_demand
        - baseline_demand
    )

    # --------------------------------------------------
    # Calculate percentage change
    # --------------------------------------------------

    if baseline_demand != 0:

        percentage_change = (
            difference
            / baseline_demand
        ) * 100

    else:

        percentage_change = 0

    # --------------------------------------------------
    # Return response
    # --------------------------------------------------

    return {

        "state": state,

        "year": year,

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