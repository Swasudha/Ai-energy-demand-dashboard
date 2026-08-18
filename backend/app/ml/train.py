import os

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


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
    os.path.dirname(os.path.abspath(__file__)),
    "model.pkl",
)

TARGET = "Max_Demand_Met_MW"

FEATURES = [
    "State",
    "Temp_Avg",
    "Humidity",
    "Rainfall",
    "Month",
    "Weekday",
    "Season",
    "Lag_1_Demand",
    "Lag_7_Demand",
]


def load_data():
    df = pd.read_csv(DATA_PATH)

    df["Date"] = pd.to_datetime(df["Date"])

    df = df.sort_values(
        ["State", "Date"]
    ).reset_index(drop=True)

    # Create state-specific lag features
    df["Lag_1_Demand"] = (
        df.groupby("State")[TARGET]
        .shift(1)
    )

    df["Lag_7_Demand"] = (
        df.groupby("State")[TARGET]
        .shift(7)
    )

    # Remove rows where lag values are unavailable
    df = df.dropna(
        subset=[
            "Lag_1_Demand",
            "Lag_7_Demand",
        ]
    )

    return df


def build_pipeline():
    categorical_features = [
        "State",
        "Weekday",
        "Season",
    ]

    numeric_features = [
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

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1,
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )


def main():
    print("Loading dataset...")

    df = load_data()

    print(f"Total records after lag creation: {len(df)}")

    # Time-based split
    split_date = df["Date"].quantile(0.8)

    train_df = df[
        df["Date"] <= split_date
    ].copy()

    test_df = df[
        df["Date"] > split_date
    ].copy()

    X_train = train_df[FEATURES]
    y_train = train_df[TARGET]

    X_test = test_df[FEATURES]
    y_test = test_df[TARGET]

    print(f"Training records: {len(train_df)}")
    print(f"Testing records: {len(test_df)}")
    print(f"Split date: {split_date.date()}")

    print("\nTraining Random Forest...")

    pipeline = build_pipeline()

    pipeline.fit(
        X_train,
        y_train,
    )

    print("Training completed.")

    predictions = pipeline.predict(X_test)

    # ML metrics
    mae = mean_absolute_error(
        y_test,
        predictions,
    )

    rmse = mean_squared_error(
        y_test,
        predictions,
    ) ** 0.5

    # Previous-day demand baseline
    baseline_predictions = test_df[
        "Lag_1_Demand"
    ]

    baseline_mae = mean_absolute_error(
        y_test,
        baseline_predictions,
    )

    print("\n==============================")
    print("Demand Prediction Results")
    print("==============================")

    print(f"ML MAE       : {mae:.2f}")
    print(f"ML RMSE      : {rmse:.2f}")
    print(f"Baseline MAE : {baseline_mae:.2f}")

    if mae < baseline_mae:
        print("Result       : ML model beats baseline")
    else:
        print("Result       : Baseline beats ML model")

    # Save model
    joblib.dump(
        pipeline,
        MODEL_PATH,
    )

    print("\nModel saved successfully:")
    print(MODEL_PATH)


if __name__ == "__main__":
    main()