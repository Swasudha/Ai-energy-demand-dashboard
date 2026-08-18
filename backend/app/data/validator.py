from .loader import load_dataset


def check_invalid_values(df):
    print("\nInvalid Values:")

    numeric_columns = [
        "Max_Demand_Met_MW",
        "Energy_Met_MU",
        "Temp_Avg",
        "Temp_Max",
        "Temp_Min",
        "Humidity",
        "Rainfall",
    ]

    for column in numeric_columns:
        if column in df.columns:
            negative_count = (df[column] < 0).sum()

            print(
                f"  {column}: "
                f"{negative_count} negative values"
            )


def check_required_columns(df):
    required_columns = [
        "State",
        "Date",
        "Max_Demand_Met_MW",
        "Energy_Met_MU",
        "Temp_Avg",
        "Temp_Max",
        "Temp_Min",
        "Humidity",
        "Rainfall",
        "Month",
        "Weekday",
        "Season",
    ]

    print("\nRequired Columns:")

    for column in required_columns:
        status = "FOUND" if column in df.columns else "MISSING"
        print(f"  {column}: {status}")


def validate_dataset():
    df = load_dataset()

    print("\n========== DATASET VALIDATION ==========\n")

    # Rows and columns
    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")

    # Column names
    print("\nColumns:")
    for column in df.columns:
        print(f"  - {column}")

    # Data types
    print("\nData Types:")
    print(df.dtypes)

    # Missing values
    print("\nMissing Values:")
    print(df.isnull().sum())

    # Duplicate rows
    print("\nDuplicate Rows:")
    print(df.duplicated().sum())

    # Invalid numeric values
    check_invalid_values(df)

    # Required columns
    check_required_columns(df)

    # Date range
    if "Date" in df.columns:
        df["Date"] = df["Date"].astype(str)

        print("\nDate Range:")
        print(f"Start: {df['Date'].min()}")
        print(f"End:   {df['Date'].max()}")

    # States
    if "State" in df.columns:
        states = sorted(df["State"].dropna().unique())

        print(f"\nStates ({len(states)}):")

        for state in states:
            print(f"  - {state}")

    print("\n========================================\n")

    return df


if __name__ == "__main__":
    validate_dataset()