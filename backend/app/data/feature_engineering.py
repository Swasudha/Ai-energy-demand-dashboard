import pandas as pd


def create_features(df):
    """
    Create ML features for demand prediction.

    Lag features are calculated separately for each state.
    """

    df = df.copy()

    # Make sure data is sorted state-wise by date
    df["Date"] = pd.to_datetime(df["Date"])

    df = df.sort_values(["State", "Date"]).reset_index(drop=True)

    # Calendar features
    df["Month"] = df["Date"].dt.month
    df["Weekday"] = df["Date"].dt.weekday

    # Season
    df["Season"] = df["Month"].map({
        12: "Winter",
        1: "Winter",
        2: "Winter",
        3: "Summer",
        4: "Summer",
        5: "Summer",
        6: "Monsoon",
        7: "Monsoon",
        8: "Monsoon",
        9: "Monsoon",
        10: "Post-Monsoon",
        11: "Post-Monsoon"
    })

    # Demand column used for lag features
    demand_column = "Max_Demand_Met_MW"

    # IMPORTANT:
    # Calculate lag separately within each State.
    df["Lag_1_Demand"] = (
        df.groupby("State")[demand_column]
        .shift(1)
    )

    df["Lag_7_Demand"] = (
        df.groupby("State")[demand_column]
        .shift(7)
    )

    # Keep only the required ML features
    feature_columns = [
        "State",
        "Temp_Avg",
        "Humidity",
        "Rainfall",
        "Month",
        "Weekday",
        "Season",
        "Lag_1_Demand",
        "Lag_7_Demand"
    ]

    return df[feature_columns]