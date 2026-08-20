import os

import joblib
import pandas as pd


# ============================================================
# MODEL PATHS
# ============================================================

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


# ============================================================
# LOAD TRAINED MODELS
# ============================================================

model = joblib.load(
    MODEL_PATH
)

yearly_trend = joblib.load(
    TREND_MODEL_PATH
)


# ============================================================
# RANDOM FOREST PREDICTION
# ============================================================

def predict_demand(
    state,
    year,
    temp_avg,
    humidity,
    rainfall,
    month,
    weekday,
    season,
    lag_1_demand,
    lag_7_demand,
):
    """
    Generate the base electricity-demand prediction
    using the trained Random Forest model.
    """

    # --------------------------------------------------------
    # Create input DataFrame
    # --------------------------------------------------------

    input_data = pd.DataFrame(
        [
            {
                "State": state,
                "Year": int(year),
                "Temp_Avg": float(
                    temp_avg
                ),
                "Humidity": float(
                    humidity
                ),
                "Rainfall": float(
                    rainfall
                ),
                "Month": int(month),
                "Weekday": weekday,
                "Season": season,
                "Lag_1_Demand": float(
                    lag_1_demand
                ),
                "Lag_7_Demand": float(
                    lag_7_demand
                ),
            }
        ]
    )

    # --------------------------------------------------------
    # Random Forest prediction
    # --------------------------------------------------------

    prediction = model.predict(
        input_data
    )[0]

    return float(
        prediction
    )


# ============================================================
# YEAR TREND ADJUSTMENT
# ============================================================

def apply_year_trend(
    state,
    year,
    base_prediction,
):
    """
    Adjust the prediction for years outside the
    historical dataset range using the historical
    yearly demand trend for the selected state.
    """

    # --------------------------------------------------------
    # Get selected state's yearly data
    # --------------------------------------------------------

    state_data = yearly_trend[
        yearly_trend["State"] == state
    ].copy()

    # --------------------------------------------------------
    # State not found
    # --------------------------------------------------------

    if state_data.empty:

        return float(
            base_prediction
        )

    # --------------------------------------------------------
    # Find historical year range
    # --------------------------------------------------------

    min_year = int(
        state_data["Year"].min()
    )

    max_year = int(
        state_data["Year"].max()
    )

    # --------------------------------------------------------
    # Historical year
    #
    # If the requested year exists within the
    # dataset's historical range, use the
    # Random Forest prediction directly.
    # --------------------------------------------------------

    if (
        min_year <= year
        and year <= max_year
    ):

        return float(
            base_prediction
        )

    # --------------------------------------------------------
    # Get first year's average demand
    # --------------------------------------------------------

    first_year_data = (
        state_data[
            state_data["Year"]
            == min_year
        ]["Average_Demand_MW"]
    )

    # --------------------------------------------------------
    # Get latest year's average demand
    # --------------------------------------------------------

    last_year_data = (
        state_data[
            state_data["Year"]
            == max_year
        ]["Average_Demand_MW"]
    )

    # --------------------------------------------------------
    # Validate trend data
    # --------------------------------------------------------

    if (
        first_year_data.empty
        or last_year_data.empty
    ):

        return float(
            base_prediction
        )

    first_value = float(
        first_year_data.iloc[0]
    )

    last_value = float(
        last_year_data.iloc[0]
    )

    # --------------------------------------------------------
    # Number of years between first and latest data
    # --------------------------------------------------------

    years_between = (
        max_year
        - min_year
    )

    # --------------------------------------------------------
    # Cannot calculate annual growth
    # --------------------------------------------------------

    if (
        years_between <= 0
        or first_value <= 0
    ):

        return float(
            base_prediction
        )

    # ========================================================
    # Calculate historical annual growth rate
    #
    # CAGR =
    #
    # (Latest Demand / First Demand)
    # ^ (1 / Number of Years) - 1
    # ========================================================

    annual_growth = (
        last_value
        / first_value
    ) ** (
        1 / years_between
    ) - 1

    # ========================================================
    # FUTURE YEAR
    # ========================================================

    if year > max_year:

        years_forward = (
            year
            - max_year
        )

        growth_factor = (
            1 + annual_growth
        ) ** years_forward

        adjusted_prediction = (
            base_prediction
            * growth_factor
        )

        return float(
            adjusted_prediction
        )

    # ========================================================
    # EARLIER YEAR
    # ========================================================

    if year < min_year:

        years_backward = (
            min_year
            - year
        )

        growth_factor = (
            1 + annual_growth
        ) ** years_backward

        # Prevent invalid division
        if growth_factor <= 0:

            return float(
                base_prediction
            )

        adjusted_prediction = (
            base_prediction
            / growth_factor
        )

        return float(
            adjusted_prediction
        )

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    return float(
        base_prediction
    )


# ============================================================
# PUBLIC YEAR-BASED PREDICTION
# ============================================================

def predict_with_year(
    state,
    year,
    temp_avg,
    humidity,
    rainfall,
    month,
    weekday,
    season,
    lag_1_demand,
    lag_7_demand,
):
    """
    Generate the final electricity-demand estimate.

    Flow:

        User inputs
             |
             v
        Random Forest
             |
             v
        Base prediction
             |
             v
        Historical yearly trend
             |
             v
        Final prediction
    """

    # --------------------------------------------------------
    # Step 1: Random Forest prediction
    # --------------------------------------------------------

    base_prediction = predict_demand(
        state=state,
        year=year,
        temp_avg=temp_avg,
        humidity=humidity,
        rainfall=rainfall,
        month=month,
        weekday=weekday,
        season=season,
        lag_1_demand=lag_1_demand,
        lag_7_demand=lag_7_demand,
    )

    # --------------------------------------------------------
    # Step 2: Apply year trend
    # --------------------------------------------------------

    final_prediction = apply_year_trend(
        state=state,
        year=year,
        base_prediction=base_prediction,
    )

    # --------------------------------------------------------
    # Step 3: Return final prediction
    # --------------------------------------------------------

    return float(
        final_prediction
    )