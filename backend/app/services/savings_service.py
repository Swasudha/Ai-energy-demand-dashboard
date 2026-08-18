from app.services.cost_service import get_state_tariff


def calculate_potential_savings(
    state,
    current_energy_mu,
    reduction_percentage,
):
    if current_energy_mu < 0:
        raise ValueError(
            "Current energy cannot be negative."
        )

    if reduction_percentage < 0 or reduction_percentage > 100:
        raise ValueError(
            "Reduction percentage must be between 0 and 100."
        )

    tariff = get_state_tariff(state)

    energy_saved_mu = (
        current_energy_mu
        * reduction_percentage
        / 100
    )

    potential_cost_saving = (
        energy_saved_mu
        * 1_000_000
        * tariff
    )

    return {
        "state": state,
        "currentEnergyMU": round(
            float(current_energy_mu),
            2,
        ),
        "reductionPercentage": round(
            float(reduction_percentage),
            2,
        ),
        "energySavedMU": round(
            float(energy_saved_mu),
            2,
        ),
        "tariffRsPerKWh": round(
            float(tariff),
            2,
        ),
        "potentialCostSaving": float(
            round(
                potential_cost_saving,
                2,
            )
        ),
    }