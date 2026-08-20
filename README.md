Project Title:
AI/Data-Driven Energy Demand Dashboard

An AI/data-driven web application for analyzing and predicting electricity demand across Indian states using historical electricity-demand and weather data.

The project combines historical analytics, machine-learning demand prediction, weather-impact analysis, anomaly detection, what-if scenarios, cost estimation, cost-savings projection, and data-driven insights in a React + FastAPI dashboard.

1. Project Objective

The main goal of this project is to understand how electricity demand changes across Indian states and how weather and historical demand patterns can be used to support demand analysis and prediction.

The dashboard provides:

Historical electricity-demand analysis.

Weather-impact analysis.

Statistical anomaly detection.

Machine-learning-based electricity-demand prediction.

What-if weather scenarios.

State-specific electricity cost estimation.

Potential cost-savings projection.

Data-driven insights.

2. Requirement

Cost per Unit and Cost-Savings Projection

A key requirement of this project is:

Get the cost per unit for the locations available in the dataset and project potential cost savings.

This project supports that requirement through the Cost & Savings module.

The main dataset contains:

State
Energy_Met_MU

However, the original demand/weather dataset does not contain electricity tariff rates.

Therefore, the project uses a separate state-specific tariff reference dataset.

The flow is:

State
  |
  v
State-specific tariff reference
  |
  v
Tariff (₹/kWh)
  |
  +
Energy consumption (MU)
  |
  v
Estimated electricity cost
  |
  v
Reduction percentage
  |
  v
Energy saved
  |
  v
Potential cost saving

Cost calculation

Estimated Cost
= Energy (MU)
  × 1,000,000
  × Tariff (₹/kWh)

Savings calculation

Energy Saved
= Current Energy × Reduction %

Potential Cost Saving
= Energy Saved (MU)
  × 1,000,000
  × Tariff (₹/kWh)

The result is an estimated cost and potential savings projection based on the selected state tariff reference and energy data. It is not an actual utility bill or a guaranteed financial saving.

3. Dataset

Main Dataset

File:

PSP_Weather_Merged_EDA_Cleaned.csv

The dataset contains daily state-level electricity-demand and weather information.

Important Fields

Category

Fields

Location

State

Date and Calendar

Date, Year, Month, Weekday, Season

Electricity

Max_Demand_Met_MW, Energy_Met_MU, Shortage_MW, Drawal_Schedule_MU, OD_UD_MU, Max_OD_MW, Energy_Shortage_MU

Weather

Temp_Max, Temp_Min, Temp_Avg, Humidity, Rainfall

ML Target

The machine-learning model predicts:

Max_Demand_Met_MW

Energy-Cost Field

The following dataset field is used for energy-consumption and cost calculations:

Energy_Met_MU

The dataset is historical. It does not contain today's live weather.

4. How the Project Works

The complete data flow is:

Historical Dataset
       |
       v
Data Loading and Validation
       |
       v
Feature Engineering
       |
       +----------------------+
       |                      |
       v                      v
Analytics                ML Training
       |                      |
       |                  model.pkl
       |                      |
       +----------+-----------+
                  |
                  v
             FastAPI Backend
                  |
                Axios
                  |
                  v
          React + Vite Frontend
                  |
                  v
             Dashboard

For cost and savings:

Historical Dataset
       |
       +-- State
       +-- Energy_Met_MU
                |
                v
       Tariff Reference Data
                |
                v
       Cost & Savings Service
                |
                v
         React Dashboard

5. Technology Stack

Frontend

React

Vite

JavaScript

Material UI

Axios

React Router

Recharts

Backend

Python

FastAPI

Pydantic

pandas

NumPy

scikit-learn

joblib

Machine Learning

scikit-learn

Trained model stored as model.pkl

Weather features

Calendar features

Previous-demand/lag features

Target: Max_Demand_Met_MW

6. Project Architecture

                         USER
                           |
                           v
                  React + Vite Frontend
                           |
                       Axios Calls
                           |
                           v
                    FastAPI Backend
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
      Analytics            ML          Cost & Savings
          |                |                |
          |            model.pkl             |
          |                |                |
          +----------------+----------------+
                           |
                           v
              Historical Energy + Weather
                       Dataset
                           +
                  Tariff Reference Data

Responsibilities

React + Vite

Responsible for:

User interface.

State selection.

Input collection.

Charts and tables.

Loading states.

Error states.

Displaying API results.

FastAPI

Responsible for:

Loading and processing data.

Running analytics.

Calling the ML model.

Running scenario calculations.

Calculating cost and savings.

Returning JSON responses to the frontend.

Machine Learning Model

Responsible for:

Learning demand patterns from historical data.

Using weather, calendar, and previous-demand features.

Predicting Max_Demand_Met_MW.

Dataset

Provides the historical electricity-demand and weather information used by the application.

Tariff Reference Data

Provides the state-specific tariff information required for estimated electricity cost and savings calculations.

7. Features

7.1 Historical Demand

Analyze electricity demand by:

State.

Date.

Month.

Season.

Highest demand.

Lowest demand.

API:

GET /api/historical

7.2 Weather Impact

Analyze relationships between:

Temperature and electricity demand.

Humidity and electricity demand.

Rainfall and electricity demand.

API:

GET /api/weather-impact

7.3 Anomaly Detection

The project uses state-level Z-scores to identify unusual demand.

Z = (Demand - State Mean) / State Standard Deviation

Classification:

Z >= 2       -> High
Z <= -2      -> Low
Otherwise    -> Normal

API:

GET /api/anomalies

7.4 ML Demand Prediction

The ML model uses:

State
Temperature
Humidity
Rainfall
Month
Weekday
Season
Lag 1 Demand
Lag 7 Demand

Target:

Max_Demand_Met_MW

API:

POST /api/predict

Example response:

{
  "predicted_demand": 17454.64
}

This is the project's machine-learning prediction component. The historical dataset is used as the foundation for training and prediction, while the trained model produces the predicted demand.

7.5 What-If Weather Scenario

The scenario feature compares two predictions:

Baseline weather.

Changed/scenario weather.

The backend returns:

Baseline demand.

Scenario demand.

Difference.

Percentage change.

API:

POST /api/scenario

Flow:

Baseline Weather
       |
       v
   ML Model
       |
       v
Baseline Demand


Scenario Weather
       |
       v
   ML Model
       |
       v
Scenario Demand
       |
       v
Comparison

7.6 Cost & Savings

The Cost & Savings module addresses the interviewer requirement.

Cost per unit

For each state that has a corresponding tariff reference:

State
  |
  v
Tariff (₹/kWh)

The tariff is used as a representative reference rate for cost estimation.

Estimated cost

Energy (MU)
     |
     v
Convert MU to kWh
     |
     v
Multiply by tariff
     |
     v
Estimated Cost

Calculation:

Estimated Cost
= Energy (MU)
  × 1,000,000
  × Tariff (₹/kWh)

Potential savings

A reduction percentage can be applied to the energy consumption.

Example:

Current Energy = 100 MU
Reduction      = 5%

Then:

Energy Saved
= 100 × 5%
= 5 MU

Potential savings:

Potential Cost Saving
= 5 MU
  × 1,000,000
  × Tariff

APIs:

GET  /api/tariff/{state}
POST /api/cost-analysis
POST /api/savings

Important limitation

The tariff is a reference rate used for estimation.

The result should be described as:

Estimated electricity cost.

Potential cost saving.

It should not be described as:

An actual utility bill.

A guaranteed saving.

A universal electricity price for an entire state.

7.7 AI/Data-Driven Insights

The Insights page generates information from actual backend calculations.

Examples:

Demand compared with historical average.

Temperature-demand relationship.

Humidity-demand relationship.

Rainfall-demand relationship.

Energy-saving calculations.

API:

GET /api/insights

8. Development Phases

Phase 1 — Project Setup

Create:

backend/
frontend/

Set up the Python environment and React/Vite application.

Phase 2 — Dataset Setup

Load and validate the cleaned dataset.

Validation includes:

Required columns.

Missing values.

Invalid values.

Numeric values.

Dates.

States.

Phase 3 — Feature Engineering

Create or use:

Year
Month
Weekday
Season
Lag_1_Demand
Lag_7_Demand

Lag features are generated separately for each state.

Phase 4 — Historical Analytics

Create the historical-demand service and API.

GET /api/historical

Phase 5 — Weather Impact

Create weather-demand analysis.

GET /api/weather-impact

Phase 6 — Anomaly Detection

Implement state-level statistical anomaly detection.

GET /api/anomalies

Phase 7 — ML Prediction

Train and use the demand-prediction model.

POST /api/predict

Phase 8 — What-If Scenario

Compare baseline and changed weather conditions.

POST /api/scenario

Phase 9 — Cost and Savings

Add:

State tariff reference.

Cost calculation.

Savings projection.

GET  /api/tariff/{state}
POST /api/cost-analysis
POST /api/savings

Phase 10 — Insights

Create data-driven insight generation.

GET /api/insights

Phase 11 — UI/UX

Add:

Responsive sidebar.

Responsive cards.

Loading skeletons.

Error alerts.

Empty states.

Charts.

Formatting.

Consistent spacing.

Consistent typography.

Hover effects.

Theme support.

Phase 12 — API Integration Testing

Test:

Success responses.

Invalid inputs.

Error responses.

Empty responses.

Loading states.

Frontend error handling.

Phase 13 — Backend/Frontend Integration

Development architecture:

React + Vite
http://localhost:5173
        |
        | Axios
        v
FastAPI
http://127.0.0.1:8000

FastAPI CORS is configured to allow the Vite development frontend.

Phase 14 — Production Build

Build:

npm run build

Test locally:

npm run preview

Generated directory:

frontend/
└── dist/

9. Prerequisites

Before running the project, install:

Python 3.x.

Node.js and npm.

Git.

A code editor such as Visual Studio Code.

The project also requires:

The cleaned historical dataset.

Python dependencies from requirements.txt.

Node dependencies from package.json.

The trained ML model (model.pkl).

The state-specific tariff reference data.

10. Installation

Step 1 — Clone/Open the Project

Open the project directory:

energy-demand-dashboard/

The project contains:

backend/
frontend/

Step 2 — Backend Installation

Open PowerShell in the backend directory:

cd backend

Create a virtual environment:

python -m venv venv

Activate it:

.\venv\Scripts\Activate.ps1

If PowerShell blocks script execution, use the appropriate execution-policy configuration for your development environment.

Install dependencies:

pip install -r requirements.txt

Step 3 — Frontend Installation

Open another terminal:

cd frontend

Install dependencies:

npm install

11. Configuration

The frontend and backend communicate through the FastAPI URL.

Development architecture:

Frontend
http://localhost:5173

Backend
http://127.0.0.1:8000

If the frontend API base URL is configured through an environment file, use the existing frontend .env configuration.

Example structure:

frontend/
└── .env

Keep environment-specific configuration out of source control when it contains secrets or machine-specific values.

CORS

FastAPI must allow the Vite frontend origin during development:

http://localhost:5173

For production, update CORS to allow only the deployed frontend origin.

12. Usage

Start the Backend

From backend/:

uvicorn app.main:app --reload

Open the API documentation:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/health

Start the Frontend

From frontend/:

npm run dev

Open:

http://localhost:5173

Simple Example

Predict Electricity Demand

Open the dashboard.

Select a state.

Open AI Prediction.

Enter the required weather and demand inputs.

Submit the prediction.

The React frontend sends the data to:

POST /api/predict

FastAPI sends the features to the trained ML model.

The predicted demand is returned to React.

The dashboard displays the predicted demand in MW.

Cost and Savings Example

Select a state.

Open Cost & Savings.

Retrieve the state's tariff reference.

View the energy consumption.

Enter a reduction percentage.

The backend calculates:

Energy saved.

Potential cost saving.

The dashboard displays the result.

13. API Endpoints

Method

Endpoint

Purpose

GET

/api/states

Get available states

GET

/api/historical

Historical demand analysis

GET

/api/weather-impact

Weather-demand relationships

GET

/api/anomalies

Detect demand anomalies

POST

/api/predict

Predict electricity demand

POST

/api/scenario

Run a what-if demand scenario

GET

/api/tariff/{state}

Get state tariff reference

POST

/api/cost-analysis

Estimate electricity cost

POST

/api/savings

Estimate potential savings

GET

/api/insights

Generate data-driven insights

Interactive API documentation is available through FastAPI Swagger:

http://127.0.0.1:8000/docs

14. Backend Project Structure

backend/
├── app/
│   ├── data/
│   │   ├── loader.py
│   │   ├── validator.py
│   │   └── feature_engineering.py
│   │
│   ├── ml/
│   │   ├── predict.py
│   │   └── model.pkl
│   │
│   ├── services/
│   │   ├── historical_service.py
│   │   ├── weather_service.py
│   │   ├── anomaly_service.py
│   │   ├── scenario_service.py
│   │   ├── tariff_service.py
│   │   ├── cost_service.py
│   │   ├── savings_service.py
│   │   └── insight_service.py
│   │
│   └── main.py
│
├── requirements.txt
└── data/
    └── raw/
        └── PSP_Weather_Merged_EDA_Cleaned.csv

15. Frontend Project Structure

frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorAlert.jsx
│   │   │   └── LoadingSkeleton.jsx
│   │   │
│   │   └── layout/
│   │       ├── Header.jsx
│   │       ├── MainLayout.jsx
│   │       └── Sidebar.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Historical/
│   │   ├── WeatherImpact/
│   │   ├── Anomalies/
│   │   ├── Prediction/
│   │   ├── Scenario/
│   │   ├── CostSavings/
│   │   └── Insights/
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── theme/
│   │   └── theme.js
│   │
│   ├── utils/
│   │   └── formatters.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js

16. External Data and API Scope

The current project uses the supplied historical dataset for:

Historical analytics.

Weather-impact analysis.

Anomaly detection.

ML demand prediction.

What-if scenario analysis.

Data-driven insights.

Tariff Reference Data

The original electricity-demand dataset does not contain electricity tariff rates.

The Cost & Savings module therefore uses separate state-specific tariff reference data.

Real-Time Weather

The current application does not require a runtime weather API.

The historical dataset contains historical weather observations, so it cannot provide today's actual weather.

If today's weather-based prediction is added later, the architecture would be:

Real-Time Weather API
        |
        v
Temperature / Humidity / Rainfall
        |
        v
FastAPI Backend
        |
        v
Existing ML Model
        |
        v
Predicted Demand
        |
        v
React Dashboard

The existing ML model can remain the prediction engine. Only the source of the current weather inputs would change.

17. Troubleshooting

Backend does not start

Check that the virtual environment is active:

.\venv\Scripts\Activate.ps1

Then install dependencies again:

pip install -r requirements.txt

Start FastAPI:

uvicorn app.main:app --reload

Frontend does not start

From frontend/:

npm install
npm run dev

If the port is already in use, stop the existing Vite process or use the port reported by Vite.

Frontend cannot reach FastAPI

Check that FastAPI is running:

http://127.0.0.1:8000/docs

Check that the frontend is running:

http://localhost:5173

Then check:

API base URL.

CORS configuration.

Browser developer-console errors.

FastAPI terminal logs.

CORS error

Make sure the FastAPI backend allows:

http://localhost:5173

Restart FastAPI after changing the CORS configuration.

ML prediction fails

Check that:

model.pkl exists.

The required input fields are provided.

Numeric fields contain valid numbers.

Feature names and order match the trained model.

The Python dependencies are installed.

Dataset not found

Check that the dataset exists in the expected backend data location:

backend/
└── data/
    └── raw/
        └── PSP_Weather_Merged_EDA_Cleaned.csv

Also check the dataset path used by the backend loader.

Tariff not available for a state

The selected state must have a corresponding entry in the tariff reference data.

If a state does not have a tariff reference, the system cannot calculate a representative cost or savings value for that state.

Production preview does not work

Rebuild the frontend:

npm run build

Then:

npm run preview

Check that dist/ was created.

18. Production Build

Frontend

Build:

npm run build

Output:

frontend/
└── dist/

Test locally:

npm run preview

Backend

A production backend deployment requires:

FastAPI application.

Python dependencies.

Dataset.

Trained ML model.

Environment configuration.

Production CORS configuration.

The production frontend must use the deployed FastAPI URL rather than the local development URL.

19. Core Application Flows

Historical Analysis

Select State
     |
     v
Historical Demand Data
     |
     v
Charts and Statistics

ML Demand Prediction

State
 + Weather
 + Calendar
 + Lag Demand
       |
       v
   ML Model
       |
       v
Predicted Demand

Weather Scenario

Baseline Weather
       |
       v
   ML Model
       |
       v
Baseline Demand
       |
       |
       +-------- Compare --------+
                                 |
Scenario Weather                 |
       |                         |
       v                         |
   ML Model                      |
       |                         |
       v                         |
Scenario Demand -----------------+

Cost Analysis

State
  +
Energy Consumption
  |
  v
State Tariff Reference
  |
  v
Estimated Cost

Potential Savings

Current Energy
      |
      v
Reduction Scenario
      |
      v
Energy Saved
      |
      v
State Tariff
      |
      v
Potential Cost Saving

20. Project Scope and Limitations

Current Scope

The current implementation includes:

Historical electricity-demand analysis.

Weather-impact analysis.

Statistical anomaly detection.

Machine-learning demand prediction.

What-if weather scenarios.

State-specific tariff-based cost estimation.

Potential cost-savings projection.

Data-driven insights.

Responsive React dashboard.

Current Limitations

The main dataset is historical.

The dataset does not provide today's live weather.

The original dataset does not contain tariff rates.

Cost calculations depend on the selected tariff reference.

Cost and savings values are estimates, not utility-bill calculations.

Real-time weather-based demand prediction requires a live weather API.

21. Contributing

Contributions can be made by following these steps:

Create a new branch.

git checkout -b feature/your-feature

Make the required changes.

Test the backend and frontend.

Run the production build:

npm run build

Check the Git status:

git status

Commit the changes:

git add .
git commit -m "feat: describe your change"

Push the branch and create a pull request.

Keep changes focused and update the README when adding or changing project features.

22. License

No open-source license has been specified for this project yet.

For an interview submission or private demonstration, the project can remain without a public license.

If the project is later released as an open-source project, add an appropriate license such as MIT after confirming the applicable requirements for the dataset and other project assets.

23. Final Summary

This project is a complete data-driven energy analytics application.

Historical Dataset
       |
       v
Data Validation
       |
       v
Feature Engineering
       |
       +-------------------+
       |                   |
       v                   v
   Analytics           ML Model
       |                   |
       |                   v
       |            Demand Prediction
       |                   |
       +---------+---------+
                 |
                 v
           FastAPI Backend
                 |
               Axios
                 |
                 v
          React Dashboard
                 |
                 v
      User-facing Analytics

For the cost requirement:

State
  +
Energy_Met_MU
  +
State Tariff Reference
  |
  v
Estimated Cost
  |
  v
Reduction Scenario
  |
  v
Potential Cost Savings

The project therefore combines the historical dataset for analysis and ML, a trained machine-learning model for demand prediction, FastAPI for backend processing and APIs, React for the dashboard, and state-specific tariff reference data for cost and savings estimation.