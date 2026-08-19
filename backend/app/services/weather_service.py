import pandas as pd


def get_weather_correlations(df: pd.DataFrame, state: str):
    """
    Calculate weather correlations and return
    real dataset observations for the selected state.
    """

    state_df = df[df["State"] == state].copy()

    if state_df.empty:
        raise ValueError(
            f"No weather data available for state: {state}"
        )

    required_columns = [
        "Max_Demand_Met_MW",
        "Temp_Avg",
        "Humidity",
        "Rainfall",
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in state_df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing columns: {missing_columns}"
        )

    # ---------------------------------------
    # Correlation calculation
    # ---------------------------------------

    correlation = state_df[
        required_columns
    ].corr()["Max_Demand_Met_MW"]

    # ---------------------------------------
    # Real dataset observations
    # ---------------------------------------

    observations_df = state_df[
        [
            "Date",
            "Temp_Avg",
            "Humidity",
            "Rainfall",
            "Max_Demand_Met_MW",
        ]
    ].copy()

    # Remove rows containing missing values
    observations_df = observations_df.dropna()

    observations = []

    for _, row in observations_df.iterrows():

        observations.append(
            {
                "date": str(row["Date"]),
                "temperature": round(
                    float(row["Temp_Avg"]), 2
                ),
                "humidity": round(
                    float(row["Humidity"]), 2
                ),
                "rainfall": round(
                    float(row["Rainfall"]), 2
                ),
                "demand": round(
                    float(row["Max_Demand_Met_MW"]), 2
                ),
            }
        )

    return {
        "state": state,

        "temperature_correlation": round(
            float(correlation["Temp_Avg"]),
            3,
        ),

        "humidity_correlation": round(
            float(correlation["Humidity"]),
            3,
        ),

        "rainfall_correlation": round(
            float(correlation["Rainfall"]),
            3,
        ),

        "observations": observations,
    }