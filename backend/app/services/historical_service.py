import pandas as pd


def get_daily_demand(df):
    return (
        df.groupby(["State", "Date"], as_index=False)["Max_Demand_Met_MW"]
        .sum()
        .rename(columns={"Max_Demand_Met_MW": "Daily_Demand_MW"})
    )


def get_monthly_demand(df):
    return (
        df.groupby(["State", "Month"], as_index=False)["Max_Demand_Met_MW"]
        .sum()
        .rename(columns={"Max_Demand_Met_MW": "Monthly_Demand_MW"})
    )


def get_seasonal_demand(df):
    return (
        df.groupby(["State", "Season"], as_index=False)["Max_Demand_Met_MW"]
        .sum()
        .rename(columns={"Max_Demand_Met_MW": "Seasonal_Demand_MW"})
    )


def get_highest_lowest_demand(df):
    highest = df.loc[df["Max_Demand_Met_MW"].idxmax()]
    lowest = df.loc[df["Max_Demand_Met_MW"].idxmin()]

    return {
        "highest_date": highest["Date"],
        "highest_demand": highest["Max_Demand_Met_MW"],
        "lowest_date": lowest["Date"],
        "lowest_demand": lowest["Max_Demand_Met_MW"],
    }