# Dataset Analysis

## Dataset

**File:** `PSP_Weather_Merged_EDA_Cleaned.csv`

The dataset contains state-wise electricity demand with corresponding weather observations.

## Important Columns

| Column            | Description                            |
| ----------------- | -------------------------------------- |
| State             | State associated with the observation  |
| Date              | Observation date                       |
| Max_Demand_Met_MW | Maximum electricity demand met in MW   |
| Energy_Met_MU     | Energy met in Million Units            |
| Temp_Avg          | Average temperature                    |
| Temp_Max          | Maximum temperature                    |
| Temp_Min          | Minimum temperature                    |
| Humidity          | Humidity measurement                   |
| Rainfall          | Rainfall measurement                   |
| Month             | Month of the observation               |
| Weekday           | Weekday information                    |
| Season            | Season associated with the observation |

## Validation

* **Rows:** 31,177
* **Columns:** 18
* **Date range:** 2023-04-01 to 2025-10-06
* **Number of states:** 34
* **Missing values:** 0
* **Duplicate rows:** 0
* **Required columns:** All 12 required columns are present
* **Invalid values:** No negative values were found in demand, energy, humidity, or rainfall fields. Negative temperature values were found and are considered valid because temperatures can fall below 0°C.

## Dataset Limitations

* No household-level consumption.
* No tariff information in the original dataset.
* Demand data is available at the state level.

## ML Considerations

The dataset can be used for state-level electricity demand analytics and demand prediction using weather and time-related features.
