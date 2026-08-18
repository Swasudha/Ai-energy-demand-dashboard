import pandas as pd


def detect_demand_anomalies(df):
    results = []

    for state, state_df in df.groupby("State"):
        state_df = state_df.copy()

        state_mean = state_df["Max_Demand_Met_MW"].mean()
        state_std = state_df["Max_Demand_Met_MW"].std()

        # Avoid division by zero for states with no demand variation
        if state_std == 0 or pd.isna(state_std):
            state_df["zScore"] = 0
        else:
            state_df["zScore"] = (
                state_df["Max_Demand_Met_MW"] - state_mean
            ) / state_std

        def classify(z_score):
            if z_score >= 2:
                return "High"
            elif z_score <= -2:
                return "Low"
            return "Normal"

        state_df["status"] = state_df["zScore"].apply(classify)

        for _, row in state_df.iterrows():
            results.append(
                {
                    "date": str(row["Date"]),
                    "demand": row["Max_Demand_Met_MW"],
                    "zScore": round(row["zScore"], 2),
                    "status": row["status"],
                }
            )

    return results