from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.services.cost_service import calculate_state_cost, get_state_tariff
from app.services.savings_service import calculate_potential_savings


app = FastAPI(
    title="AI Energy Demand Dashboard",
    version="1.0.0"
)


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


@app.post("/api/cost-analysis")
def cost_analysis(state: str):
    try:
        return calculate_state_cost(state)
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
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
            detail=str(error)
        )


@app.get("/api/tariff/{state}")
def tariff(state: str):
    try:
        tariff_value = get_state_tariff(state)

        return {
            "state": state,
            "tariffRsPerKWh": tariff_value
        }

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )