import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";

import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CloudIcon from "@mui/icons-material/Cloud";

import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getWeatherImpact } from "../../services/api";

function WeatherImpact() {
  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [state] = useState("Tamil Nadu");

  const [weatherData, setWeatherData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD WEATHER IMPACT DATA
  // --------------------------------------------------

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getWeatherImpact(state);

        console.log(
          "Weather Impact API response:",
          response.data
        );

        setWeatherData(response.data);
      } catch (error) {
        console.error(
          "Weather Impact API error:",
          error
        );

        setError(
          error?.response?.data?.detail ||
            "Unable to load weather impact data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, [state]);

  // --------------------------------------------------
  // OBSERVATIONS
  // --------------------------------------------------

  const observations = useMemo(() => {
    if (!weatherData?.observations) {
      return [];
    }

    return weatherData.observations
      .map((item) => ({
        date: item.date,

        temperature: Number(item.temperature),

        humidity: Number(item.humidity),

        rainfall: Number(item.rainfall),

        demand: Number(item.demand),
      }))
      .filter(
        (item) =>
          item.date &&
          Number.isFinite(item.demand)
      );
  }, [weatherData]);

  // --------------------------------------------------
  // TEMPERATURE SCATTER DATA
  // --------------------------------------------------

  const temperatureData = useMemo(() => {
    return observations.filter(
      (item) =>
        Number.isFinite(item.temperature) &&
        Number.isFinite(item.demand)
    );
  }, [observations]);

  // --------------------------------------------------
  // HUMIDITY SCATTER DATA
  // --------------------------------------------------

  const humidityData = useMemo(() => {
    return observations.filter(
      (item) =>
        Number.isFinite(item.humidity) &&
        Number.isFinite(item.demand)
    );
  }, [observations]);

  // --------------------------------------------------
  // RAINFALL SCATTER DATA
  // --------------------------------------------------

  const rainfallData = useMemo(() => {
    return observations.filter(
      (item) =>
        Number.isFinite(item.rainfall) &&
        Number.isFinite(item.demand)
    );
  }, [observations]);

  // --------------------------------------------------
  // DAILY DEMAND LINE CHART DATA
  // --------------------------------------------------

  const demandTrendData = useMemo(() => {
    return [...observations].sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );
  }, [observations]);

  // --------------------------------------------------
  // RELATIONSHIP TEXT
  // --------------------------------------------------

  const getRelationshipText = (value) => {
    const absoluteValue = Math.abs(value);

    if (absoluteValue >= 0.7) {
      return value >= 0
        ? "Strong positive relationship"
        : "Strong negative relationship";
    }

    if (absoluteValue >= 0.4) {
      return value >= 0
        ? "Moderate positive relationship"
        : "Moderate negative relationship";
    }

    return "Weak relationship";
  };

  const getRelationshipDescription = (value) => {
    const absoluteValue = Math.abs(value);

    if (absoluteValue >= 0.7) {
      return "Weather variable has a strong relationship with electricity demand.";
    }

    if (absoluteValue >= 0.4) {
      return "Weather variable has a moderate relationship with electricity demand.";
    }

    return "Weather variable has a weak relationship with electricity demand.";
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  // --------------------------------------------------
  // CORRELATIONS
  // --------------------------------------------------

  const temperatureCorrelation = Number(
    weatherData?.temperature_correlation ?? 0
  );

  const humidityCorrelation = Number(
    weatherData?.humidity_correlation ?? 0
  );

  const rainfallCorrelation = Number(
    weatherData?.rainfall_correlation ?? 0
  );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        backgroundColor: "#f5f7fb",
        p: 3,
        boxSizing: "border-box",
      }}
    >
      {/* PAGE HEADER */}

      <Typography
        variant="h3"
        fontWeight={700}
        sx={{
          color: "#1f2937",
          mb: 1,
        }}
      >
        Weather Impact
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "#374151",
          mb: 3,
        }}
      >
        Understand how temperature, humidity and
        rainfall are related to electricity demand.
      </Typography>

      {/* STATE */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Weather relationship with electricity
            demand for
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ mt: 0.5 }}
          >
            {state}
          </Typography>
        </CardContent>
      </Card>

      {/* CORRELATION CARDS */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >
        {/* TEMPERATURE */}

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <ThermostatIcon
                  sx={{ color: "#d32f2f" }}
                />

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Temperature
                </Typography>
              </Box>

              <Typography
                variant="h2"
                fontWeight={700}
                sx={{ mt: 2 }}
              >
                {temperatureCorrelation.toFixed(3)}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                {getRelationshipText(
                  temperatureCorrelation
                )}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {getRelationshipDescription(
                  temperatureCorrelation
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* HUMIDITY */}

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <WaterDropIcon
                  sx={{ color: "#1976d2" }}
                />

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Humidity
                </Typography>
              </Box>

              <Typography
                variant="h2"
                fontWeight={700}
                sx={{ mt: 2 }}
              >
                {humidityCorrelation.toFixed(3)}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                {getRelationshipText(
                  humidityCorrelation
                )}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {getRelationshipDescription(
                  humidityCorrelation
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* RAINFALL */}

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CloudIcon
                  sx={{ color: "#0288d1" }}
                />

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Rainfall
                </Typography>
              </Box>

              <Typography
                variant="h2"
                fontWeight={700}
                sx={{ mt: 2 }}
              >
                {rainfallCorrelation.toFixed(3)}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                {getRelationshipText(
                  rainfallCorrelation
                )}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {getRelationshipDescription(
                  rainfallCorrelation
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* TEMPERATURE ↔ DEMAND */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight={700}
          >
            Temperature ↔ Demand
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Relationship between average temperature
            and electricity demand.
          </Typography>

          <Box
            sx={{
              width: "100%",
              height: 450,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <ScatterChart>
                <CartesianGrid />

                <XAxis
                  type="number"
                  dataKey="temperature"
                  name="Temperature"
                  unit=" °C"
                />

                <YAxis
                  type="number"
                  dataKey="demand"
                  name="Demand"
                  unit=" MW"
                />

                <Tooltip
                  cursor={{
                    strokeDasharray: "3 3",
                  }}
                />

                <Scatter
                  name="Temperature vs Demand"
                  data={temperatureData}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* HUMIDITY ↔ DEMAND */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight={700}
          >
            Humidity ↔ Demand
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Relationship between humidity and
            electricity demand.
          </Typography>

          <Box
            sx={{
              width: "100%",
              height: 450,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <ScatterChart>
                <CartesianGrid />

                <XAxis
                  type="number"
                  dataKey="humidity"
                  name="Humidity"
                  unit="%"
                />

                <YAxis
                  type="number"
                  dataKey="demand"
                  name="Demand"
                  unit=" MW"
                />

                <Tooltip
                  cursor={{
                    strokeDasharray: "3 3",
                  }}
                />

                <Scatter
                  name="Humidity vs Demand"
                  data={humidityData}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* RAINFALL ↔ DEMAND */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight={700}
          >
            Rainfall ↔ Demand
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Relationship between rainfall and
            electricity demand.
          </Typography>

          <Box
            sx={{
              width: "100%",
              height: 450,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <ScatterChart>
                <CartesianGrid />

                <XAxis
                  type="number"
                  dataKey="rainfall"
                  name="Rainfall"
                  unit=" mm"
                />

                <YAxis
                  type="number"
                  dataKey="demand"
                  name="Demand"
                  unit=" MW"
                />

                <Tooltip
                  cursor={{
                    strokeDasharray: "3 3",
                  }}
                />

                <Scatter
                  name="Rainfall vs Demand"
                  data={rainfallData}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* =================================================
          DAILY DEMAND TREND
          REAL DATA LINE CHART
      ================================================= */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight={700}
          >
            Daily Demand Trend
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Daily electricity demand for{" "}
            <strong>{state}</strong> using real
            observations from the dataset.
          </Typography>

          {demandTrendData.length === 0 ? (
            <Alert severity="info">
              No daily demand observations are
              available for {state}.
            </Alert>
          ) : (
            <Box
              sx={{
                width: "100%",
                height: 450,
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={demandTrendData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    minTickGap={40}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Demand (MW)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${Number(
                        value
                      ).toLocaleString()} MW`,
                      "Demand",
                    ]}
                    labelFormatter={(label) =>
                      `Date: ${label}`
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="demand"
                    name="Daily Demand"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* DATA COVERAGE */}

      <Card
        sx={{
          borderRadius: 3,
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            Data Coverage
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {observations.length.toLocaleString()}{" "}
            real observations are being displayed
            for {state}.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default WeatherImpact;