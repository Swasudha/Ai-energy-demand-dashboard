import pandas as pd


def get_insights(
    df: pd.DataFrame,
    state: str,
    reduction_percentage: float = 5,
):
    """
    Generate data-driven insights for a selected state.

    Insights are calculated from actual dataset values.

    Returns:
        historical demand insight
        temperature correlation insight
        humidity correlation insight
        rainfall correlation insight
        latest demand insight
        savings insight
    """

    required_columns = [
        "Date",
        "State",
        "Max_Demand_Met_MW",
        "Temp_Avg",
        "Humidity",
        "Rainfall",
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

    # --------------------------------------------------
    # Filter state
    # --------------------------------------------------

    state_df = df[
        df["State"].astype(str).str.lower()
        == state.lower()
    ].copy()

    if state_df.empty:
        raise ValueError(
            f"State '{state}' not found"
        )

    # --------------------------------------------------
    # Convert numeric columns
    # --------------------------------------------------

    numeric_columns = [
        "Max_Demand_Met_MW",
        "Temp_Avg",
        "Humidity",
        "Rainfall",
    ]

    for column in numeric_columns:
        state_df[column] = pd.to_numeric(
            state_df[column],
            errors="coerce",
        )

    state_df = state_df.dropna(
        subset=[
            "Max_Demand_Met_MW",
            "Temp_Avg",
            "Humidity",
            "Rainfall",
        ]
    )

    if state_df.empty:
        raise ValueError(
            f"No valid data available for {state}"
        )

    # --------------------------------------------------
    # Historical average
    # --------------------------------------------------

    historical_average = (
        state_df["Max_Demand_Met_MW"]
        .mean()
    )

    # Latest available observation
    state_df["Date"] = pd.to_datetime(
        state_df["Date"],
        errors="coerce",
    )

    state_df = state_df.dropna(
        subset=["Date"]
    )

    state_df = state_df.sort_values("Date")

    latest_row = state_df.iloc[-1]

    latest_demand = float(
        latest_row["Max_Demand_Met_MW"]
    )

    latest_date = latest_row["Date"].strftime(
        "%Y-%m-%d"
    )

    # --------------------------------------------------
    # Demand vs historical average
    # --------------------------------------------------

    if historical_average != 0:

        demand_difference_percentage = (
            (
                latest_demand
                - historical_average
            )
            / historical_average
        ) * 100

    else:
        demand_difference_percentage = 0

    if demand_difference_percentage > 0:

        historical_message = (
            f"Demand is "
            f"{abs(demand_difference_percentage):.1f}% "
            f"above the historical average."
        )

        historical_status = "warning"

    elif demand_difference_percentage < 0:

        historical_message = (
            f"Demand is "
            f"{abs(demand_difference_percentage):.1f}% "
            f"below the historical average."
        )

        historical_status = "info"

    else:

        historical_message = (
            "Demand is close to the historical average."
        )

        historical_status = "normal"

    # --------------------------------------------------
    # Weather correlations
    # --------------------------------------------------

    temperature_correlation = state_df[
        "Temp_Avg"
    ].corr(
        state_df["Max_Demand_Met_MW"]
    )

    humidity_correlation = state_df[
        "Humidity"
    ].corr(
        state_df["Max_Demand_Met_MW"]
    )

    rainfall_correlation = state_df[
        "Rainfall"
    ].corr(
        state_df["Max_Demand_Met_MW"]
    )

    # Handle NaN correlations
    temperature_correlation = (
        0
        if pd.isna(temperature_correlation)
        else float(temperature_correlation)
    )

    humidity_correlation = (
        0
        if pd.isna(humidity_correlation)
        else float(humidity_correlation)
    )

    rainfall_correlation = (
        0
        if pd.isna(rainfall_correlation)
        else float(rainfall_correlation)
    )

    # --------------------------------------------------
    # Correlation message helper
    # --------------------------------------------------

    def correlation_message(
        variable,
        correlation,
    ):

        absolute_value = abs(correlation)

        if absolute_value >= 0.7:
            strength = "strong"

        elif absolute_value >= 0.4:
            strength = "moderate"

        elif absolute_value >= 0.2:
            strength = "weak"

        else:
            strength = "very weak"

        if correlation > 0:

            direction = "positive"

        elif correlation < 0:

            direction = "negative"

        else:

            direction = "no clear"

        if direction == "no clear":

            message = (
                f"{variable} has no clear "
                f"relationship with electricity demand."
            )

        else:

            message = (
                f"{variable} has a "
                f"{strength} {direction} "
                f"relationship with electricity demand."
            )

        return message

    temperature_message = correlation_message(
        "Temperature",
        temperature_correlation,
    )

    humidity_message = correlation_message(
        "Humidity",
        humidity_correlation,
    )

    rainfall_message = correlation_message(
        "Rainfall",
        rainfall_correlation,
    )

    # --------------------------------------------------
    # Savings calculation
    # --------------------------------------------------

    if reduction_percentage < 0:
        reduction_percentage = 0

    if reduction_percentage > 100:
        reduction_percentage = 100

    # Use latest available energy value if available.
    if "Energy_Met_MU" in state_df.columns:

        state_df["Energy_Met_MU"] = pd.to_numeric(
            state_df["Energy_Met_MU"],
            errors="coerce",
        )

        energy_values = state_df[
            "Energy_Met_MU"
        ].dropna()

        if not energy_values.empty:

            current_energy_mu = float(
                energy_values.iloc[-1]
            )

        else:

            current_energy_mu = 0

    else:

        current_energy_mu = 0

    energy_saved_mu = (
        current_energy_mu
        * reduction_percentage
        / 100
    )

    # --------------------------------------------------
    # Build response
    # --------------------------------------------------

    return {
        "state": state,

        "latestDate": latest_date,

        "latestDemand": round(
            latest_demand,
            2,
        ),

        "historicalAverage": round(
            float(historical_average),
            2,
        ),

        "demandDifferencePercentage": round(
            float(
                demand_difference_percentage
            ),
            2,
        ),

        "temperatureCorrelation": round(
            temperature_correlation,
            3,
        ),

        "humidityCorrelation": round(
            humidity_correlation,
            3,
        ),

        "rainfallCorrelation": round(
            rainfall_correlation,
            3,
        ),

        "currentEnergyMU": round(
            current_energy_mu,
            2,
        ),

        "reductionPercentage": round(
            reduction_percentage,
            2,
        ),

        "energySavedMU": round(
            energy_saved_mu,
            2,
        ),

        "historicalInsight": {
            "message": historical_message,
            "status": historical_status,
        },

        "temperatureInsight": {
            "message": temperature_message,
            "correlation": round(
                temperature_correlation,
                3,
            ),
        },

        "humidityInsight": {
            "message": humidity_message,
            "correlation": round(
                humidity_correlation,
                3,
            ),
        },

        "rainfallInsight": {
            "message": rainfall_message,
            "correlation": round(
                rainfall_correlation,
                3,
            ),
        },
    }