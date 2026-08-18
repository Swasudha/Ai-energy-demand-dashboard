import os

import joblib
import pandas as pd


MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "model.pkl",
)


def load_model():
    return joblib.load(MODEL_PATH)


def predict_demand(
    state,
    temp_avg,
    humidity,
    rainfall,
    month,
    weekday,
    season,
    lag_1_demand,
    lag_7_demand,
):
    model = load_model()

    input_data = pd.DataFrame(
        [
            {
                "State": state,
                "Temp_Avg": temp_avg,
                "Humidity": humidity,
                "Rainfall": rainfall,
                "Month": month,
                "Weekday": weekday,
                "Season": season,
                "Lag_1_Demand": lag_1_demand,
                "Lag_7_Demand": lag_7_demand,
            }
        ]
    )

    prediction = model.predict(input_data)[0]

    return {
        "predicted_demand": round(float(prediction), 2)
    }