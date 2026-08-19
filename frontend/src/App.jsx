import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Historical from "./pages/Historical/Historical";
import WeatherImpact from "./pages/WeatherImpact/WeatherImpact";
import Anomalies from "./pages/Anomalies/Anomalies";
import Prediction from "./pages/Prediction/Prediction";
import Scenario from "./pages/Scenario/scenario";
import CostSavings from "./pages/CostSavings/CostSavings";
import Insights from "./pages/Insights/Insights";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/historical"
          element={<Historical />}
        />

        <Route
          path="/weather-impact"
          element={<WeatherImpact />}
        />

        <Route
          path="/anomalies"
          element={<Anomalies />}
        />

        <Route
          path="/prediction"
          element={<Prediction />}
        />

        <Route
          path="/scenario"
          element={<Scenario />}
        />

        <Route
          path="/cost-savings"
          element={<CostSavings />}
        />

        <Route
          path="/insights"
          element={<Insights />}
       />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </MainLayout>
  );
}

export default App;