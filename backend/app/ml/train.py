import os

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )
    )
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "raw",
    "PSP_Weather_Merged_EDA_Cleaned.csv",
)

MODEL_PATH = os.path.join(
    os.path.dirname(
        os.path.abspath(__file__)
    ),
    "model.pkl",
)

TREND_MODEL_PATH = os.path.join(
    os.path.dirname(
        os.path.abspath(__file__)
    ),
    "year_trend.pkl",
)


# --------------------------------------------------
# TARGET
# --------------------------------------------------

TARGET = "Max_Demand_Met_MW"


# --------------------------------------------------
# FEATURES
# --------------------------------------------------

FEATURES = [
    "State",
    "Year",
    "Temp_Avg",
    "Humidity",
    "Rainfall",
    "Month",
    "Weekday",
    "Season",
    "Lag_1_Demand",
    "Lag_7_Demand",
]


# --------------------------------------------------
# LOAD AND PREPARE DATA
# --------------------------------------------------

def load_data():

    print("Reading dataset...")

    df = pd.read_csv(DATA_PATH)

    print(f"Dataset records: {len(df)}")

    # Convert date
    df["Date"] = pd.to_datetime(
        df["Date"],
        errors="coerce"
    )

    # Remove invalid dates
    df = df.dropna(
        subset=["Date"]
    )

    # Sort by state and date
    df = df.sort_values(
        ["State", "Date"]
    ).reset_index(drop=True)

    # --------------------------------------------------
    # Calendar features
    # --------------------------------------------------

    df["Year"] = df["Date"].dt.year

    df["Month"] = df["Date"].dt.month

    df["Weekday"] = (
        df["Date"]
        .dt
        .day_name()
    )

    # --------------------------------------------------
    # Season
    # --------------------------------------------------

    def get_season(month):

        if month in [3, 4, 5, 6]:
            return "Summer"

        if month in [7, 8, 9, 10]:
            return "Monsoon"

        return "Winter"

    df["Season"] = (
        df["Month"]
        .apply(get_season)
    )

    # --------------------------------------------------
    # State-specific lag features
    # --------------------------------------------------

    df["Lag_1_Demand"] = (
        df
        .groupby("State")[TARGET]
        .shift(1)
    )

    df["Lag_7_Demand"] = (
        df
        .groupby("State")[TARGET]
        .shift(7)
    )

    # --------------------------------------------------
    # Remove rows without lag values
    # --------------------------------------------------

    df = df.dropna(
        subset=[
            "Lag_1_Demand",
            "Lag_7_Demand",
        ]
    )

    # --------------------------------------------------
    # Remove rows with missing model features
    # --------------------------------------------------

    required_columns = (
        FEATURES
        + [TARGET]
    )

    df = df.dropna(
        subset=required_columns
    )

    return df


# --------------------------------------------------
# BUILD RANDOM FOREST PIPELINE
# --------------------------------------------------

def build_pipeline():

    categorical_features = [
        "State",
        "Weekday",
        "Season",
    ]

    numeric_features = [
        "Year",
        "Temp_Avg",
        "Humidity",
        "Rainfall",
        "Month",
        "Lag_1_Demand",
        "Lag_7_Demand",
    ]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                categorical_features,
            ),
            (
                "numeric",
                "passthrough",
                numeric_features,
            ),
        ]
    )

    # --------------------------------------------------
    # Random Forest
    # --------------------------------------------------

    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=20,
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline(
        steps=[
            (
                "preprocessor",
                preprocessor,
            ),
            (
                "model",
                model,
            ),
        ]
    )

    return pipeline


# --------------------------------------------------
# BUILD YEARLY DEMAND TREND
# --------------------------------------------------

def build_year_trend(df):

    yearly = (
        df
        .groupby(
            [
                "State",
                "Year",
            ],
            as_index=False,
        )[TARGET]
        .mean()
        .rename(
            columns={
                TARGET:
                    "Average_Demand_MW"
            }
        )
    )

    return yearly


# --------------------------------------------------
# MAIN TRAINING FUNCTION
# --------------------------------------------------

def main():

    print("\n==============================")
    print("Energy Demand ML Training")
    print("==============================")

    # --------------------------------------------------
    # Load data
    # --------------------------------------------------

    print("\nLoading dataset...")

    df = load_data()

    print(
        f"Total records after "
        f"feature engineering: {len(df)}"
    )

    # --------------------------------------------------
    # Time-based train/test split
    # --------------------------------------------------

    split_date = (
        df["Date"]
        .quantile(0.80)
    )

    train_df = df[
        df["Date"] <= split_date
    ].copy()

    test_df = df[
        df["Date"] > split_date
    ].copy()

    print(
        f"Training records: "
        f"{len(train_df)}"
    )

    print(
        f"Testing records: "
        f"{len(test_df)}"
    )

    print(
        f"Split date: "
        f"{split_date.date()}"
    )

    # --------------------------------------------------
    # Training data
    # --------------------------------------------------

    X_train = train_df[
        FEATURES
    ]

    y_train = train_df[
        TARGET
    ]

    # --------------------------------------------------
    # Testing data
    # --------------------------------------------------

    X_test = test_df[
        FEATURES
    ]

    y_test = test_df[
        TARGET
    ]

    # --------------------------------------------------
    # Train Random Forest
    # --------------------------------------------------

    print(
        "\nTraining Random Forest..."
    )

    pipeline = build_pipeline()

    pipeline.fit(
        X_train,
        y_train,
    )

    print(
        "Random Forest training completed."
    )

    # --------------------------------------------------
    # Predictions
    # --------------------------------------------------

    print(
        "\nGenerating test predictions..."
    )

    predictions = pipeline.predict(
        X_test
    )

    # --------------------------------------------------
    # ML metrics
    # --------------------------------------------------

    mae = mean_absolute_error(
        y_test,
        predictions,
    )

    rmse = (
        mean_squared_error(
            y_test,
            predictions,
        )
        ** 0.5
    )

    # --------------------------------------------------
    # Previous-day baseline
    # --------------------------------------------------

    baseline_predictions = (
        test_df[
            "Lag_1_Demand"
        ]
    )

    baseline_mae = (
        mean_absolute_error(
            y_test,
            baseline_predictions,
        )
    )

    # --------------------------------------------------
    # Display results
    # --------------------------------------------------

    print(
        "\n=============================="
    )

    print(
        "Demand Prediction Results"
    )

    print(
        "=============================="
    )

    print(
        f"ML MAE       : {mae:.2f}"
    )

    print(
        f"ML RMSE      : {rmse:.2f}"
    )

    print(
        f"Baseline MAE : {baseline_mae:.2f}"
    )

    if mae < baseline_mae:

        print(
            "Result       : "
            "ML model beats baseline"
        )

    else:

        print(
            "Result       : "
            "Baseline beats ML model"
        )

    # --------------------------------------------------
    # Save Random Forest model
    # --------------------------------------------------

    joblib.dump(
        pipeline,
        MODEL_PATH,
    )

    print(
        "\nRandom Forest model saved:"
    )

    print(
        MODEL_PATH
    )

    # --------------------------------------------------
    # Build yearly demand trend
    # --------------------------------------------------

    print(
        "\nBuilding yearly demand trend..."
    )

    yearly = build_year_trend(
        df
    )

    # --------------------------------------------------
    # Save yearly trend
    # --------------------------------------------------

    joblib.dump(
        yearly,
        TREND_MODEL_PATH,
    )

    print(
        "Yearly demand trend saved:"
    )

    print(
        TREND_MODEL_PATH
    )

    print(
        "\nTraining completed successfully."
    )


# --------------------------------------------------
# ENTRY POINT
# --------------------------------------------------

if __name__ == "__main__":

    main()