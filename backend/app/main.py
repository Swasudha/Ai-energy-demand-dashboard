from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.data.loader import load_dataset
from app.ml.predict import predict_demand

from app.services.anomaly_service import detect_demand_anomalies
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


app = FastAPI(
    title="AI Energy Demand Dashboard",
    version="1.0.0",
)


class PredictionRequest(BaseModel):
    state: str
    temp_avg: float
    humidity: float
    rainfall: float
    month: int
    weekday: str
    season: str
    lag_1_demand: float
    lag_7_demand: float


class ScenarioRequest(BaseModel):
    state: str
    date: str
    current_temperature: float
    scenario_temperature: float
    humidity: float
    rainfall: float


class SavingsRequest(BaseModel):
    state: str
    currentEnergyMU: float
    reductionPercentage: float


@app.get("/")
def root():
    return {
        "message": "AI Energy Demand Dashboard API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


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


@app.get("/api/historical")
def historical():
    df = load_dataset()

    daily = get_daily_demand(df)
    monthly = get_monthly_demand(df)
    seasonal = get_seasonal_demand(df)
    highest_lowest = get_highest_lowest_demand(df)

    return {
        "daily": daily.to_dict(orient="records"),
        "monthly": monthly.to_dict(orient="records"),
        "seasonal": seasonal.to_dict(orient="records"),
        "highestLowest": {
            "highest_date": highest_lowest["highest_date"],
            "highest_demand": float(
                highest_lowest["highest_demand"]
            ),
            "lowest_date": highest_lowest["lowest_date"],
            "lowest_demand": float(
                highest_lowest["lowest_demand"]
            ),
        },
    }


@app.get("/api/weather-impact")
def weather_impact(state: str):
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


@app.get("/api/anomalies")
def anomalies():
    df = load_dataset()

    return detect_demand_anomalies(df)


@app.get("/api/tariff/{state}")
def tariff(state: str):
    return get_tariff(state)


@app.post("/api/predict")
def predict(request: PredictionRequest):
    try:
        return predict_demand(
            state=request.state,
            temp_avg=request.temp_avg,
            humidity=request.humidity,
            rainfall=request.rainfall,
            month=request.month,
            weekday=request.weekday,
            season=request.season,
            lag_1_demand=request.lag_1_demand,
            lag_7_demand=request.lag_7_demand,
        )
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@app.post("/api/scenario")
def scenario(request: ScenarioRequest):
    try:
        return run_weather_scenario(
            state=request.state,
            date=request.date,
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


@app.post("/api/cost-analysis")
def cost_analysis(state: str):
    try:
        return calculate_state_cost(state)
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@app.post("/api/savings")
def savings(request: SavingsRequest):
    try:
        return calculate_potential_savings(
            state=request.state,
            current_energy_mu=request.currentEnergyMU,
            reduction_percentage=request.reductionPercentage,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )