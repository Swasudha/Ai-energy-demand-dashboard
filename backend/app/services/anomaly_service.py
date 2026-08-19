import pandas as pd


def get_anomalies(df: pd.DataFrame):
    """
    Detect electricity demand anomalies separately for each state.

    Z-score:
        Z = (demand - state_mean) / state_std

    Classification:
        Z >= 2   -> High
        Z <= -2  -> Low
        otherwise -> Normal

    Returns:
        date
        state
        demand
        expectedDemand
        deviation
        zScore
        status
    """

    required_columns = [
        "Date",
        "State",
        "Max_Demand_Met_MW",
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing columns: {missing_columns}"
        )

    # Work on a copy so the original dataset is not modified
    data = df[
        required_columns
    ].copy()

    # Make sure demand is numeric
    data["Max_Demand_Met_MW"] = pd.to_numeric(
        data["Max_Demand_Met_MW"],
        errors="coerce",
    )

    # Remove invalid demand values
    data = data.dropna(
        subset=[
            "Date",
            "State",
            "Max_Demand_Met_MW",
        ]
    )

    # Make sure dates are sorted
    data["Date"] = pd.to_datetime(
        data["Date"],
        errors="coerce",
    )

    data = data.dropna(
        subset=["Date"]
    )

    data = data.sort_values(
        ["State", "Date"]
    )

    # --------------------------------------------------
    # Calculate state-level statistics
    # --------------------------------------------------

    state_stats = (
        data.groupby("State")[
            "Max_Demand_Met_MW"
        ]
        .agg(
            state_mean="mean",
            state_std="std",
        )
        .reset_index()
    )

    # --------------------------------------------------
    # Join statistics back to each record
    # --------------------------------------------------

    data = data.merge(
        state_stats,
        on="State",
        how="left",
    )

    # --------------------------------------------------
    # Expected demand
    #
    # For anomaly detection, expected demand is the
    # average demand of the selected state.
    # --------------------------------------------------

    data["expectedDemand"] = data[
        "state_mean"
    ]

    # --------------------------------------------------
    # Deviation
    #
    # Actual demand - expected demand
    # --------------------------------------------------

    data["deviation"] = (
        data["Max_Demand_Met_MW"]
        - data["expectedDemand"]
    )

    # --------------------------------------------------
    # Z-score
    # --------------------------------------------------

    data["zScore"] = (
        data["deviation"]
        / data["state_std"]
    )

    # Avoid infinite values if standard deviation is 0
    data["zScore"] = data[
        "zScore"
    ].replace(
        [float("inf"), float("-inf")],
        0,
    )

    data["zScore"] = data[
        "zScore"
    ].fillna(0)

    # --------------------------------------------------
    # Status classification
    # --------------------------------------------------

    def classify_status(z):
        if z >= 2:
            return "High"

        if z <= -2:
            return "Low"

        return "Normal"

    data["status"] = data[
        "zScore"
    ].apply(classify_status)

    # --------------------------------------------------
    # Convert to API response
    # --------------------------------------------------

    result = []

    for _, row in data.iterrows():

        result.append(
            {
                "date": row["Date"].strftime(
                    "%Y-%m-%d"
                ),

                "state": row["State"],

                "demand": round(
                    float(
                        row[
                            "Max_Demand_Met_MW"
                        ]
                    ),
                    2,
                ),

                "expectedDemand": round(
                    float(
                        row[
                            "expectedDemand"
                        ]
                    ),
                    2,
                ),

                "deviation": round(
                    float(
                        row[
                            "deviation"
                        ]
                    ),
                    2,
                ),

                "zScore": round(
                    float(
                        row[
                            "zScore"
                        ]
                    ),
                    2,
                ),

                "status": row["status"],
            }
        )

    return result