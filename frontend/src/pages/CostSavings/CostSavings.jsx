import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

function CostSavings() {
    function formatLargeCurrency(value) {
  if (value >= 1_000_000_000_000) {
    return `₹${(value / 1_000_000_000_000).toFixed(2)} Trillion`;
  }

  if (value >= 1_000_000_000) {
    return `₹${(value / 1_000_000_000).toFixed(2)} Billion`;
  }

  if (value >= 1_000_000) {
    return `₹${(value / 1_000_000).toFixed(2)} Million`;
  }

  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(2)} Lakh`;
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
}
  const [states, setStates] = useState([]);
  const [state, setState] = useState("Tamil Nadu");

  const [reductionPercentage, setReductionPercentage] = useState(5);

  const [tariff, setTariff] = useState(null);
  const [costData, setCostData] = useState(null);
  const [savingsData, setSavingsData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load states
  // --------------------------------------------------

  useEffect(() => {
    async function loadStates() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/states"
        );

        if (!response.ok) {
          throw new Error("Failed to load states");
        }

        const data = await response.json();

        setStates(data.states || []);
      } catch (error) {
        setError(error.message);
      }
    }

    loadStates();
  }, []);

  // --------------------------------------------------
  // Load cost, tariff and savings data
  // --------------------------------------------------

  useEffect(() => {
    if (!state) {
      return;
    }

    loadCostData(state);
  }, [state]);

  async function loadCostData(selectedState) {
    setLoading(true);
    setError("");

    try {
      const encodedState = encodeURIComponent(
        selectedState
      );

      // -------------------------------
      // Get tariff
      // -------------------------------

      const tariffResponse = await fetch(
        `http://127.0.0.1:8000/api/tariff/${encodedState}`
      );

      if (!tariffResponse.ok) {
        throw new Error("Failed to load tariff");
      }

      const tariffResult =
        await tariffResponse.json();

      setTariff(tariffResult);

      // -------------------------------
      // Cost analysis
      // -------------------------------

      const costResponse = await fetch(
        `http://127.0.0.1:8000/api/cost-analysis?state=${encodedState}`,
        {
          method: "POST",
        }
      );

      if (!costResponse.ok) {
        const errorData =
          await costResponse.json();

        throw new Error(
          errorData.detail ||
            "Failed to calculate cost"
        );
      }

      const costResult =
        await costResponse.json();

      setCostData(costResult);

      // -------------------------------
      // Savings
      // -------------------------------

      await loadSavings(
        selectedState,
        costResult.energyMU,
        reductionPercentage
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSavings(
    selectedState,
    energyMU,
    reduction
  ) {
    const response = await fetch(
      "http://127.0.0.1:8000/api/savings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: selectedState,
          currentEnergyMU: Number(energyMU),
          reductionPercentage: Number(reduction),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(
        errorData.detail ||
          "Failed to calculate savings"
      );
    }

    const result = await response.json();

    setSavingsData(result);
  }

  // --------------------------------------------------
  // Recalculate savings
  // --------------------------------------------------

  async function handleSavingsCalculation() {
    if (!costData) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await loadSavings(
        state,
        costData.energyMU,
        reductionPercentage
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Formatting helpers
  // --------------------------------------------------

  function formatNumber(value) {
    if (value === null || value === undefined) {
      return "-";
    }

    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatCurrency(value) {
    if (value === null || value === undefined) {
      return "-";
    }

    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value)}`;
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <Box>
      <Typography
        variant="h3"
        fontWeight={700}
        gutterBottom
      >
        Cost & Savings
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Analyze electricity cost and estimate
        potential savings from demand reduction.
      </Typography>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Inputs */}
      <Card
        sx={{
          borderRadius: 4,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
          >
            Cost Analysis Inputs
          </Typography>

          <Grid
            container
            spacing={3}
            alignItems="center"
          >
            {/* State */}
            <Grid item xs={12} md={5}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                State
              </Typography>

              <Select
                fullWidth
                value={state}
                onChange={(event) =>
                  setState(event.target.value)
                }
              >
                {states.length > 0 ? (
                  states.map((item) => (
                    <MenuItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="Tamil Nadu">
                    Tamil Nadu
                  </MenuItem>
                )}
              </Select>
            </Grid>

            {/* Reduction */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Reduction (%)"
                type="number"
                value={reductionPercentage}
                onChange={(event) =>
                  setReductionPercentage(
                    Number(event.target.value)
                  )
                }
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 1,
                }}
              />
            </Grid>

            {/* Button */}
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={
                  handleSavingsCalculation
                }
                disabled={
                  loading || !costData
                }
                sx={{
                  height: 56,
                  fontWeight: 700,
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    color="inherit"
                  />
                ) : (
                  "Calculate Savings"
                )}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Cost Cards */}
      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >
        {/* Tariff */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                color="text.secondary"
                gutterBottom
              >
                State Tariff
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                {tariff
                  ? `₹${formatNumber(
                      tariff.tariffRsPerKWh ??
                        tariff.tariff ??
                        tariff.rate
                    )}`
                  : "-"}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                per kWh
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Energy */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                color="text.secondary"
                gutterBottom
              >
                Energy Consumption
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                {costData
                  ? `${formatNumber(
                      costData.energyMU
                    )} MU`
                  : "-"}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Total energy consumption
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Estimated Cost */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                color="text.secondary"
                gutterBottom
              >
                Estimated Cost
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
              >
                {costData
                  ? formatCurrency(
                      costData.estimatedCost
                    )
                  : "-"}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Estimated electricity cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Savings Section */}
      <Card
        sx={{
          borderRadius: 4,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
          >
            Potential Savings
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Estimated savings from reducing energy
            consumption.
          </Typography>

          <Grid
            container
            spacing={3}
          >
            {/* Reduction */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor:
                    "background.default",
                }}
              >
                <Typography
                  color="text.secondary"
                >
                  Reduction
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ mt: 1 }}
                >
                  {savingsData
                    ? `${formatNumber(
                        savingsData.reductionPercentage
                      )}%`
                    : `${reductionPercentage}%`}
                </Typography>
              </Box>
            </Grid>

            {/* Energy Saved */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor:
                    "background.default",
                }}
              >
                <Typography
                  color="text.secondary"
                >
                  Energy Saved
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ mt: 1 }}
                >
                  {savingsData
                    ? `${formatNumber(
                        savingsData.energySavedMU
                      )} MU`
                    : "-"}
                </Typography>
              </Box>
            </Grid>

            {/* Potential Savings */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor:
                    "background.default",
                }}
              >
                <Typography
                  color="text.secondary"
                >
                  Potential Savings
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ mt: 1 }}
                >
                  {savingsData
                    ? formatCurrency(
                        savingsData.potentialCostSaving
                      )
                    : "-"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary */}
      {costData && savingsData && (
        <Card
          sx={{
            borderRadius: 4,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
            >
              Cost & Savings Summary
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ lineHeight: 1.8 }}
            >
              For <strong>{state}</strong>, the
              current energy consumption is{" "}
              <strong>
                {formatNumber(
                  costData.energyMU
                )}{" "}
                MU
              </strong>{" "}
              with a tariff of{" "}
              <strong>
                ₹
                {formatNumber(
                  costData.tariffRsPerKWh
                )}{" "}
                / kWh
              </strong>
              .
              <br />
              A{" "}
              <strong>
                {savingsData.reductionPercentage}%
              </strong>{" "}
              reduction could save approximately{" "}
              <strong>
                {formatNumber(
                  savingsData.energySavedMU
                )}{" "}
                MU
              </strong>{" "}
              and provide potential savings of{" "}
              <strong>
                {formatCurrency(
                  savingsData.potentialCostSaving
                )}
              </strong>
              .
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default CostSavings;