from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.data.loader import load_dataset
from app.ml.predict import predict_with_year

from app.services.insight_service import get_insights
from app.services.anomaly_service import get_anomalies
from app.services.cost_service import calculate_state_cost
from app.services.historical_service import (
    get_daily_demand,
    get_monthly_demand,
    get_seasonal_demand,
    get_highest_lowest_demand,
)
from app.services.savings_service import calculate_potential_savings
from app.services.scenario_service import run_weather_scenario
from app.services.tariff_service import get_tariff
from app.services.weather_service import get_weather_correlations


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AI Energy Demand Dashboard",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-energy-demand-dashboard.vercel.app",
        "https://ai-energy-demand-dashboard-6mq4jyf9d-s-swathi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class PredictionRequest(BaseModel):
    """
    Input required for electricity demand prediction.
    """

    state: str

    year: int = Field(
        ...,
        ge=1900,
        le=2200,
    )

    temp_avg: float

    humidity: float

    rainfall: float

    month: int = Field(
        ...,
        ge=1,
        le=12,
    )

    weekday: str

    season: str

    lag_1_demand: float

    lag_7_demand: float


class ScenarioRequest(BaseModel):
    state: str
    year: int = Field(..., ge=1900, le=2200)
    current_temperature: float
    scenario_temperature: float
    humidity: float
    rainfall: float

class SavingsRequest(BaseModel):
    state: str
    currentEnergyMU: float
    reductionPercentage: float


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "AI Energy Demand Dashboard API is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ============================================================
# STATES
# ============================================================

@app.get("/api/states")
def states():

    df = load_dataset()

    states = sorted(
        df["State"]
        .dropna()
        .unique()
        .tolist()
    )

    return {
        "states": states
    }


# ============================================================
# HISTORICAL ANALYTICS
# ============================================================

@app.get("/api/historical")
def historical(
    state: str | None = None
):

    df = load_dataset()

    # --------------------------------------------------------
    # Filter by state
    # --------------------------------------------------------

    if state:

        available_states = (
            df["State"]
            .dropna()
            .unique()
            .tolist()
        )

        if state not in available_states:

            raise HTTPException(
                status_code=404,
                detail=f"State '{state}' not found",
            )

        df = df[
            df["State"] == state
        ].copy()

    # --------------------------------------------------------
    # Analytics
    # --------------------------------------------------------

    daily = get_daily_demand(
        df
    )

    monthly = get_monthly_demand(
        df
    )

    seasonal = get_seasonal_demand(
        df
    )

    highest_lowest = (
        get_highest_lowest_demand(
            df
        )
    )

    return {
        "state": state,

        "daily": daily.to_dict(
            orient="records"
        ),

        "monthly": monthly.to_dict(
            orient="records"
        ),

        "seasonal": seasonal.to_dict(
            orient="records"
        ),

        "highestLowest": {
            "highest_date":
                highest_lowest[
                    "highest_date"
                ],

            "highest_demand":
                float(
                    highest_lowest[
                        "highest_demand"
                    ]
                ),

            "lowest_date":
                highest_lowest[
                    "lowest_date"
                ],

            "lowest_demand":
                float(
                    highest_lowest[
                        "lowest_demand"
                    ]
                ),
        },
    }


# ============================================================
# WEATHER IMPACT
# ============================================================

@app.get("/api/weather-impact")
def weather_impact(
    state: str
):

    df = load_dataset()

    try:

        return get_weather_correlations(
            df,
            state,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


# ============================================================
# ANOMALIES
# ============================================================

@app.get("/api/anomalies")
def anomalies():

    df = load_dataset()

    return get_anomalies(
        df
    )


# ============================================================
# TARIFF
# ============================================================

@app.get("/api/tariff/{state}")
def tariff(
    state: str
):

    return get_tariff(
        state
    )


# ============================================================
# AI DEMAND PREDICTION
# ============================================================

@app.post("/api/predict")
def predict(
    request: PredictionRequest
):

    try:

        predicted_demand = (
            predict_with_year(
                state=request.state,
                year=request.year,
                temp_avg=request.temp_avg,
                humidity=request.humidity,
                rainfall=request.rainfall,
                month=request.month,
                weekday=request.weekday,
                season=request.season,
                lag_1_demand=request.lag_1_demand,
                lag_7_demand=request.lag_7_demand,
            )
        )

        return {
            "state": request.state,

            "year": request.year,

            "predicted_demand": round(
                predicted_demand,
                2,
            ),
        }

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# WEATHER SCENARIO
# ============================================================

@app.post("/api/scenario")
def scenario(request: ScenarioRequest):
    try:
        return run_weather_scenario(
            state=request.state,
            year=request.year,
            current_temperature=request.current_temperature,
            scenario_temperature=request.scenario_temperature,
            humidity=request.humidity,
            rainfall=request.rainfall,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# COST ANALYSIS
# ============================================================

@app.post("/api/cost-analysis")
def cost_analysis(
    state: str
):

    try:

        return calculate_state_cost(
            state
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


# ============================================================
# POTENTIAL SAVINGS
# ============================================================

@app.post("/api/savings")
def savings(
    request: SavingsRequest
):

    try:

        return calculate_potential_savings(
            state=request.state,

            current_energy_mu=(
                request.currentEnergyMU
            ),

            reduction_percentage=(
                request.reductionPercentage
            ),
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# AI / DATA-DRIVEN INSIGHTS
# ============================================================

@app.get("/api/insights")
def insights(
    state: str,
    reduction_percentage: float = 5,
):

    df = load_dataset()

    try:

        return get_insights(
            df=df,

            state=state,

            reduction_percentage=(
                reduction_percentage
            ),
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )