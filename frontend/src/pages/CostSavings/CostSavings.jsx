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

import {
  getStates,
  getTariff,
  getCostAnalysis,
  getSavings,
} from "../../services/api";


function CostSavings() {

  // ==================================================
  // STATE
  // ==================================================

  const [states, setStates] = useState([]);

  const [state, setState] = useState("Tamil Nadu");

  const [reductionPercentage, setReductionPercentage] =
    useState(5);

  const [tariff, setTariff] = useState(null);

  const [costData, setCostData] = useState(null);

  const [savingsData, setSavingsData] = useState(null);

  const [loadingStates, setLoadingStates] =
    useState(false);

  const [loadingCost, setLoadingCost] =
    useState(false);

  const [loadingSavings, setLoadingSavings] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // ==================================================
  // FORMAT NUMBER
  // ==================================================

  function formatNumber(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "-";
    }

    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(number);
  }


  // ==================================================
  // FORMAT CURRENCY
  // ==================================================

  function formatCurrency(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "-";
    }

    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(number)}`;
  }


  // ==================================================
  // FORMAT LARGE CURRENCY
  // ==================================================

  function formatLargeCurrency(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "-";
    }

    if (number >= 1_000_000_000_000) {
      return `₹${(
        number / 1_000_000_000_000
      ).toFixed(2)} Trillion`;
    }

    if (number >= 1_000_000_000) {
      return `₹${(
        number / 1_000_000_000
      ).toFixed(2)} Billion`;
    }

    if (number >= 1_000_000) {
      return `₹${(
        number / 1_000_000
      ).toFixed(2)} Million`;
    }

    if (number >= 100_000) {
      return `₹${(
        number / 100_000
      ).toFixed(2)} Lakh`;
    }

    return formatCurrency(number);
  }


  // ==================================================
  // LOAD STATES
  // ==================================================

  useEffect(() => {

    async function loadStates() {

      try {

        setLoadingStates(true);

        setError("");

        const response =
          await getStates();

        console.log(
          "GET /api/states:",
          response.data
        );

        const stateList =
          response.data?.states || [];

        setStates(stateList);

        if (
          stateList.length > 0 &&
          !stateList.includes(state)
        ) {
          setState(stateList[0]);
        }

      } catch (err) {

        console.error(
          "States error:",
          err
        );

        setError(
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load states."
        );

      } finally {

        setLoadingStates(false);

      }
    }

    loadStates();

  }, []);


  // ==================================================
  // LOAD COST DATA WHEN STATE CHANGES
  // ==================================================

  useEffect(() => {

    if (!state) {
      return;
    }

    loadCostData(state);

  }, [state]);


  // ==================================================
  // LOAD TARIFF + COST
  // ==================================================

  async function loadCostData(selectedState) {

    try {

      setLoadingCost(true);

      setError("");

      setSuccess("");

      // Clear previous savings
      setSavingsData(null);


      // ----------------------------------------------
      // TARIFF
      // ----------------------------------------------

      const tariffResponse =
        await getTariff(selectedState);

      console.log(
        "GET /api/tariff:",
        tariffResponse.data
      );

      setTariff(
        tariffResponse.data
      );


      // ----------------------------------------------
      // COST ANALYSIS
      // ----------------------------------------------

      const costResponse =
        await getCostAnalysis(
          selectedState
        );

      console.log(
        "POST /api/cost-analysis:",
        costResponse.data
      );

      setCostData(
        costResponse.data
      );

    } catch (err) {

      console.error(
        "Cost analysis error:",
        err
      );

      setTariff(null);

      setCostData(null);

      setSavingsData(null);

      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to load cost information."
      );

    } finally {

      setLoadingCost(false);

    }
  }


  // ==================================================
  // CALCULATE SAVINGS
  // ==================================================

  async function handleSavingsCalculation() {

    console.log(
      "Calculate Savings button clicked"
    );

    setError("");

    setSuccess("");

    setSavingsData(null);


    // ----------------------------------------------
    // Check cost data
    // ----------------------------------------------

    if (!costData) {

      setError(
        "Cost data is not available yet."
      );

      return;
    }


    // ----------------------------------------------
    // Validate reduction
    // ----------------------------------------------

    const reduction =
      Number(reductionPercentage);

    if (!Number.isFinite(reduction)) {

      setError(
        "Please enter a valid reduction percentage."
      );

      return;
    }


    if (
      reduction < 0 ||
      reduction > 100
    ) {

      setError(
        "Reduction percentage must be between 0 and 100."
      );

      return;
    }


    // ----------------------------------------------
    // Get energy
    // ----------------------------------------------

    const energy =
      Number(
        costData.energyMU
      );

    if (!Number.isFinite(energy)) {

      setError(
        "Energy consumption is not available."
      );

      return;
    }


    // ----------------------------------------------
    // Request body
    // ----------------------------------------------

    const requestData = {

      state: state,

      currentEnergyMU: energy,

      reductionPercentage:
        reduction,

    };


    console.log(
      "POST /api/savings request:",
      requestData
    );


    try {

      setLoadingSavings(true);


      // --------------------------------------------
      // CALL BACKEND
      // --------------------------------------------

      const response =
        await getSavings(
          requestData
        );


      console.log(
        "POST /api/savings response:",
        response.data
      );


      // --------------------------------------------
      // SAVE RESULT
      // --------------------------------------------

      setSavingsData(
        response.data
      );


      setSuccess(
        "Potential savings calculated successfully."
      );


    } catch (err) {

      console.error(
        "Savings API error:",
        err
      );


      console.error(
        "Savings API response:",
        err?.response?.data
      );


      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to calculate potential savings."
      );


    } finally {

      setLoadingSavings(false);

    }
  }


  // ==================================================
  // UI
  // ==================================================

  return (

    <Box>

      {/* ============================================
          PAGE HEADER
      ============================================ */}

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


      {/* ============================================
          ERROR
      ============================================ */}

      {error && (

        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>

      )}


      {/* ============================================
          SUCCESS
      ============================================ */}

      {success && (

        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>

      )}


      {/* ============================================
          INPUT CARD
      ============================================ */}

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

            {/* STATE */}

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
                onChange={(event) => {

                  setState(
                    event.target.value
                  );

                  setSavingsData(null);

                }}
                disabled={
                  loadingStates ||
                  loadingCost
                }
              >

                {states.map((item) => (

                  <MenuItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </MenuItem>

                ))}

              </Select>

            </Grid>


            {/* REDUCTION */}

            <Grid item xs={12} md={4}>

              <TextField
                fullWidth
                label="Reduction (%)"
                type="number"
                value={
                  reductionPercentage
                }
                onChange={(event) => {

                  setReductionPercentage(
                    event.target.value
                  );

                  // Remove old savings result
                  // because the percentage changed.
                  setSavingsData(null);

                  setSuccess("");

                }}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 1,
                }}
              />

            </Grid>


            {/* BUTTON */}

            <Grid item xs={12} md={3}>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={
                  handleSavingsCalculation
                }
                disabled={
                  loadingCost ||
                  loadingSavings ||
                  !costData
                }
                sx={{
                  height: 56,
                  fontWeight: 700,
                }}
              >

                {loadingSavings ? (

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


      {/* ============================================
          COST CARDS
      ============================================ */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >

        {/* TARIFF */}

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


              {tariff?.source && (

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Source: {tariff.source}
                </Typography>

              )}

            </CardContent>

          </Card>

        </Grid>


        {/* ENERGY */}

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


        {/* ESTIMATED COST */}

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
                sx={{
                  wordBreak: "break-word",
                }}
              >

                {costData
                  ? formatLargeCurrency(
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


      {/* ============================================
          POTENTIAL SAVINGS
      ============================================ */}

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
            Estimated savings from reducing
            energy consumption.
          </Typography>


          <Grid
            container
            spacing={3}
          >

            {/* REDUCTION */}

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


            {/* ENERGY SAVED */}

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


            {/* POTENTIAL SAVINGS */}

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
                  sx={{
                    mt: 1,
                    wordBreak:
                      "break-word",
                  }}
                >

                  {savingsData
                    ? formatLargeCurrency(
                        savingsData.potentialCostSaving
                      )
                    : "-"}

                </Typography>

              </Box>

            </Grid>

          </Grid>

        </CardContent>

      </Card>


      {/* ============================================
          SUMMARY
      ============================================ */}

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
              sx={{
                lineHeight: 1.8,
              }}
            >

              For{" "}

              <strong>
                {state}
              </strong>

              , the current energy consumption
              is{" "}

              <strong>
                {formatNumber(
                  costData.energyMU
                )}{" "}
                MU
              </strong>

              {" "}with a tariff of{" "}

              <strong>
                ₹
                {formatNumber(
                  costData.tariffRsPerKWh ??
                  tariff?.tariffRsPerKWh ??
                  tariff?.tariff ??
                  tariff?.rate
                )}{" "}
                / kWh
              </strong>

              .

              <br />

              A{" "}

              <strong>
                {savingsData.reductionPercentage}%
              </strong>

              {" "}reduction could save approximately{" "}

              <strong>
                {formatNumber(
                  savingsData.energySavedMU
                )}{" "}
                MU
              </strong>

              {" "}and provide potential savings
              of{" "}

              <strong>
                {formatLargeCurrency(
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