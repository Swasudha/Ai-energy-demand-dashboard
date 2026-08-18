import pandas as pd


def get_weather_correlations(df, state):
    state_df = df[df["State"] == state].copy()

    if state_df.empty:
        raise ValueError(f"No data found for state: {state}")

    demand_column = "Max_Demand_Met_MW"

    correlations = {
        "temperature_correlation": state_df["Temp_Avg"].corr(
            state_df[demand_column]
        ),
        "humidity_correlation": state_df["Humidity"].corr(
            state_df[demand_column]
        ),
        "rainfall_correlation": state_df["Rainfall"].corr(
            state_df[demand_column]
        ),
    }

    chart_data = state_df[
        [
            "Date",
            "Temp_Avg",
            "Humidity",
            "Rainfall",
            demand_column,
        ]
    ].rename(
        columns={
            "Temp_Avg": "temperature",
            "Humidity": "humidity",
            "Rainfall": "rainfall",
            demand_column: "demand",
        }
    )

    chart_data["Date"] = chart_data["Date"].astype(str)

    return {
        "state": state,
        "correlations": correlations,
        "chart_data": chart_data.to_dict(orient="records"),
    }