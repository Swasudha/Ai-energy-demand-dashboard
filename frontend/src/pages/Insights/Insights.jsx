import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CloudIcon from "@mui/icons-material/Cloud";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';


function Insights() {
  const [states, setStates] = useState([]);

  const [state, setState] = useState("Tamil Nadu");

  const [insights, setInsights] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  /*
   * Load states
   */

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/states`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load states");
        }

        return response.json();
      })
      .then((data) => {
        const stateList = Array.isArray(data)
          ? data
          : data.states || [];

        setStates(stateList);
      })
      .catch(() => {
        setStates([
          "Tamil Nadu",
          "Andhra Pradesh",
          "Karnataka",
          "Kerala",
          "Maharashtra",
          "Telangana",
        ]);
      });
  }, []);


  /*
   * Load insights
   */

  useEffect(() => {
    if (!state) {
      return;
    }

    loadInsights(state);
  }, [state]);


  const loadInsights = async (
    selectedState
  ) => {
    try {
      setLoading(true);

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/insights?state=${encodeURIComponent(
          selectedState
        )}`
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Failed to load insights"
        );
      }

      const data = await response.json();

      setInsights(data);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load AI insights."
      );

      setInsights(null);
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status) => {
    if (status === "warning") {
      return "#d32f2f";
    }

    if (status === "info") {
      return "#1976d2";
    }

    return "#2e7d32";
  };


  return (
    <Box>
      {/* Header */}

      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
      >
        AI Insights
      </Typography>


      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Data-driven insights generated from electricity
        demand, weather relationships and energy
        consumption.
      </Typography>


      {/* State selector */}

      <Card
        sx={{
          borderRadius: 4,
          mb: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 2 }}
          >
            Insight Filters
          </Typography>


          <FormControl
            size="small"
            sx={{
              minWidth: 220,
            }}
          >
            <InputLabel>
              State
            </InputLabel>

            <Select
              value={state}
              label="State"
              onChange={(event) =>
                setState(event.target.value)
              }
            >
              {states.map((item) => {
                const stateName =
                  typeof item === "string"
                    ? item
                    : item.state;

                return (
                  <MenuItem
                    key={stateName}
                    value={stateName}
                  >
                    {stateName}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </CardContent>
      </Card>


      {/* Loading */}

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      )}


      {/* Error */}

      {error && !loading && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}


      {/* Insights */}

      {insights && !loading && (
        <>
          {/* Historical demand */}

          <Card
            sx={{
              borderRadius: 4,
              mb: 2,
              borderLeft: "5px solid #d32f2f",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <WarningAmberIcon
                  sx={{
                    color: getStatusColor(
                      insights
                        .historicalInsight
                        ?.status
                    ),
                    fontSize: 32,
                  }}
                />

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Demand vs Historical Average
                  </Typography>

                  <Typography
                    sx={{ mt: 0.5 }}
                  >
                    {
                      insights
                        .historicalInsight
                        ?.message
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Latest demand:{" "}
                    {Number(
                      insights.latestDemand
                    ).toLocaleString("en-IN")}{" "}
                    MW
                    {" • "}
                    Historical average:{" "}
                    {Number(
                      insights.historicalAverage
                    ).toLocaleString("en-IN")}{" "}
                    MW
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>


          {/* Temperature */}

          <Card
            sx={{
              borderRadius: 4,
              mb: 2,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <ThermostatIcon
                  sx={{
                    color: "#d32f2f",
                    fontSize: 32,
                  }}
                />

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Temperature Impact
                  </Typography>

                  <Typography
                    sx={{ mt: 0.5 }}
                  >
                    {
                      insights
                        .temperatureInsight
                        ?.message
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Correlation:{" "}
                    {
                      insights
                        .temperatureCorrelation
                    }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>


          {/* Humidity */}

          <Card
            sx={{
              borderRadius: 4,
              mb: 2,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <WaterDropIcon
                  sx={{
                    color: "#1976d2",
                    fontSize: 32,
                  }}
                />

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Humidity Impact
                  </Typography>

                  <Typography
                    sx={{ mt: 0.5 }}
                  >
                    {
                      insights
                        .humidityInsight
                        ?.message
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Correlation:{" "}
                    {
                      insights
                        .humidityCorrelation
                    }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>


          {/* Rainfall */}

          <Card
            sx={{
              borderRadius: 4,
              mb: 2,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <CloudIcon
                  sx={{
                    color: "#0288d1",
                    fontSize: 32,
                  }}
                />

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Rainfall Impact
                  </Typography>

                  <Typography
                    sx={{ mt: 0.5 }}
                  >
                    {
                      insights
                        .rainfallInsight
                        ?.message
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Correlation:{" "}
                    {
                      insights
                        .rainfallCorrelation
                    }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>


          {/* Energy savings */}

          <Card
            sx={{
              borderRadius: 4,
              mb: 2,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <TrendingUpIcon
                  sx={{
                    color: "#2e7d32",
                    fontSize: 32,
                  }}
                />

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Energy Reduction Opportunity
                  </Typography>

                  <Typography
                    sx={{ mt: 0.5 }}
                  >
                    A{" "}
                    {
                      insights.reductionPercentage
                    }
                    % reduction could save approximately{" "}
                    {Number(
                      insights.energySavedMU
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    MU of energy.
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Based on the latest available energy
                    consumption of{" "}
                    {Number(
                      insights.currentEnergyMU
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    MU.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>


          {/* Data source information */}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3 }}
          >
            Insights are calculated from actual
            historical observations for{" "}
            <strong>{insights.state}</strong>. Latest
            available observation:{" "}
            <strong>{insights.latestDate}</strong>.
          </Typography>
        </>
      )}
    </Box>
  );
}


export default Insights;