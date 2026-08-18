from app.data.tariff_loader import load_tariffs


def get_tariff(state):
    tariffs = load_tariffs()

    match = tariffs[
        tariffs["state"].str.strip().str.lower()
        == state.strip().lower()
    ]

    if match.empty:
        return {
            "state": state,
            "tariff": None,
            "unit": "₹/kWh",
            "type": "No tariff available",
            "source": None
        }

    row = match.iloc[0]

    return {
        "state": row["state"],
        "tariff": float(row["tariff_rs_per_kwh"]),
        "unit": "₹/kWh",
        "type": row["tariff_type"],
        "source": row["source"]
    }