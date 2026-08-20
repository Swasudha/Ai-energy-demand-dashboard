import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { predictDemand } from "../../services/api";


function Prediction() {

  const currentYear =
    new Date().getFullYear();


  const [formData, setFormData] =
    useState({

      state: "Tamil Nadu",

      year: currentYear,

      temp_avg: 30,

      humidity: 65,

      rainfall: 0,

      month: 5,

      weekday: "Monday",

      season: "Summer",

      lag_1_demand: 16500,

      lag_7_demand: 16000,

    });


  const [prediction, setPrediction] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // --------------------------------------------------
  // HANDLE INPUT
  // --------------------------------------------------

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };


  // --------------------------------------------------
  // PREDICT
  // --------------------------------------------------

  const handlePredict = async () => {

    try {

      setError("");

      setPrediction(null);


      // ----------------------------------------------
      // Validation
      // ----------------------------------------------

      const year =
        Number(formData.year);

      const temperature =
        Number(formData.temp_avg);

      const humidity =
        Number(formData.humidity);

      const rainfall =
        Number(formData.rainfall);

      const month =
        Number(formData.month);

      const lag1 =
        Number(formData.lag_1_demand);

      const lag7 =
        Number(formData.lag_7_demand);


      if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > 2200
      ) {

        setError(
          "Please enter a valid year between 1900 and 2200."
        );

        return;
      }


      if (
        !Number.isFinite(temperature) ||
        !Number.isFinite(humidity) ||
        !Number.isFinite(rainfall) ||
        !Number.isFinite(lag1) ||
        !Number.isFinite(lag7)
      ) {

        setError(
          "Please enter valid numeric prediction inputs."
        );

        return;
      }


      if (
        month < 1 ||
        month > 12
      ) {

        setError(
          "Month must be between 1 and 12."
        );

        return;
      }


      setLoading(true);


      // ----------------------------------------------
      // API payload
      // ----------------------------------------------

      const payload = {

        state:
          formData.state,

        year,

        temp_avg:
          temperature,

        humidity,

        rainfall,

        month,

        weekday:
          formData.weekday,

        season:
          formData.season,

        lag_1_demand:
          lag1,

        lag_7_demand:
          lag7,

      };


      console.log(
        "Prediction request:",
        payload
      );


      const response =
        await predictDemand(
          payload
        );


      console.log(
        "Prediction response:",
        response.data
      );


      setPrediction(
        response.data
      );


    } catch (err) {

      console.error(
        "Prediction failed:",
        err
      );


      setError(
        err?.response?.data?.detail ||
          "Unable to generate prediction. Please check the backend."
      );


    } finally {

      setLoading(false);

    }

  };


  // --------------------------------------------------
  // FORMAT NUMBER
  // --------------------------------------------------

  const formatNumber =
    (value) => {

      return Number(
        value
      ).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

    };


  return (

    <Box
      sx={{
        p: {
          xs: 2,
          md: 3,
        },

        backgroundColor:
          "#F5F7FA",

        minHeight:
          "100%",
      }}
    >

      {/* -------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------- */}

      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          mb: 1,
          color: "#172B4D",
          fontSize: {
            xs: "2rem",
            md: "2.5rem",
          },
        }}
      >
        AI Demand Prediction
      </Typography>


      <Typography
        color="text.secondary"
        sx={{
          mb: 3,
        }}
      >
        Predict electricity demand using
        weather, calendar, historical demand
        and the selected year.
      </Typography>


      {/* -------------------------------------------- */}
      {/* ERROR */}
      {/* -------------------------------------------- */}

      {error && (

        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>

      )}


      {/* -------------------------------------------- */}
      {/* INPUT CARD */}
      {/* -------------------------------------------- */}

      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
        }}
      >

        <CardContent
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >

          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mb: 3,
            }}
          >
            Prediction Inputs
          </Typography>


          <Grid
            container
            spacing={2.5}
          >

            {/* -------------------------------------- */}
            {/* STATE */}
            {/* -------------------------------------- */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >

              <FormControl
                fullWidth
              >

                <InputLabel>
                  State
                </InputLabel>

                <Select
                  name="state"
                  value={
                    formData.state
                  }
                  label="State"
                  onChange={
                    handleChange
                  }
                >

                  <MenuItem value="Tamil Nadu">
                    Tamil Nadu
                  </MenuItem>

                  <MenuItem value="Kerala">
                    Kerala
                  </MenuItem>

                  <MenuItem value="Karnataka">
                    Karnataka
                  </MenuItem>

                  <MenuItem value="Andhra Pradesh">
                    Andhra Pradesh
                  </MenuItem>

                  <MenuItem value="Telangana">
                    Telangana
                  </MenuItem>

                </Select>

              </FormControl>

            </Grid>


            {/* -------------------------------------- */}
            {/* YEAR */}
            {/* -------------------------------------- */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >

              <TextField
                fullWidth
                label="Year"
                name="year"
                type="number"
                value={
                  formData.year
                }
                onChange={
                  handleChange
                }
                inputProps={{
                  min: 1900,
                  max: 2200,
                }}
                helperText="Enter any year"
              />

            </Grid>


            {/* -------------------------------------- */}
            {/* TEMPERATURE */}
            {/* -------------------------------------- */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >

              <TextField
                fullWidth
                label="Temperature (°C)"
                name="temp_avg"
                type="number"
                value={
                  formData.temp_avg
                }
                onChange={
                  handleChange
                }
              />

            </Grid>


            {/* -------------------------------------- */}
            {/* HUMIDITY */}
            {/* -------------------------------------- */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >

              <TextField
                fullWidth
                label="Humidity (%)"
                name="humidity"
                type="number"
                value={
                  formData.humidity
                }
                onChange={
                  handleChange
                }
              />

            </Grid>


            {/* -------------------------------------- */}
            {/* RAINFALL */}
            {/* -------------------------------------- */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >

              <TextField
                fullWidth
                label="Rainfall (mm)"
                name="rainfall"
                type="number"
                value={
                  formData.rainfall
                }
                onChange={
                  handleChange
                }
              />

            </Grid>


            {/* -------------------------------------- */}
            {/* MONTH */}
            {/* -------------------------------------- */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >

              <TextField
                fullWidth
                label="Month"
                name="month"
                type="number"
                value={
                  formData.month
                }
                onChange={
                  handleChange
                }
                inputProps={{
                  min: 1,
                  max: 12,
                }}
              />

            </Grid>


            {/* -------------------------------------- */}
            {/* WEEKDAY */}
            {/* -------------------------------------- */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >

              <FormControl
                fullWidth
              >

                <InputLabel>
                  Weekday
                </InputLabel>

                <Select
                  name="weekday"
                  value={
                    formData.weekday
                  }
                  label="Weekday"
                  onChange={
                    handleChange
                  }
                >

                  <MenuItem value="Monday">
                    Monday
                  </MenuItem>

                  <MenuItem value="Tuesday">
                    Tuesday
                  </MenuItem>

                  <MenuItem value="Wednesday">
                    Wednesday
                  </MenuItem>

                  <MenuItem value="Thursday">
                    Thursday
                  </MenuItem>

                  <MenuItem value="Friday">
                    Friday
                  </MenuItem>

                  <MenuItem value="Saturday">
                    Saturday
                  </MenuItem>

                  <MenuItem value="Sunday">
                    Sunday
                  </MenuItem>

                </Select>

              </FormControl>

            </Grid>


            {/* -------------------------------------- */}
            {/* SEASON */}
            {/* -------------------------------------- */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >

              <FormControl
                fullWidth
              >

                <InputLabel>
                  Season
                </InputLabel>

                <Select
                  name="season"
                  value={
                    formData.season
                  }
                  label="Season"
                  onChange={
                    handleChange
                  }
                >

                  <MenuItem value="Summer">
                    Summer
                  </MenuItem>

                  <MenuItem value="Monsoon">
                    Monsoon
                  </MenuItem>

                  <MenuItem value="Winter">
                    Winter
                  </MenuItem>

                </Select>

              </FormControl>

            </Grid>


            {/* -------------------------------------- */}
            {/* LAG 1 */}
            {/* -------------------------------------- */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >

              <TextField
                fullWidth
                label="Lag 1 Demand (MW)"
                name="lag_1_demand"
                type="number"
                value={
                  formData.lag_1_demand
                }
                onChange={
                  handleChange
                }
              />

            </Grid>


            {/* -------------------------------------- */}
            {/* LAG 7 */}
            {/* -------------------------------------- */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >

              <TextField
                fullWidth
                label="Lag 7 Demand (MW)"
                name="lag_7_demand"
                type="number"
                value={
                  formData.lag_7_demand
                }
                onChange={
                  handleChange
                }
              />

            </Grid>


            {/* -------------------------------------- */}
            {/* BUTTON */}
            {/* -------------------------------------- */}

            <Grid
              item
              xs={12}
              md={3}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={
                  handlePredict
                }
                disabled={
                  loading
                }
                sx={{
                  minHeight: 56,
                  fontWeight: 700,
                  borderRadius: 2,
                }}
              >

                {loading
                  ? "Predicting..."
                  : "Predict Demand"}

              </Button>

            </Grid>

          </Grid>

        </CardContent>

      </Card>


      {/* -------------------------------------------- */}
      {/* RESULT */}
      {/* -------------------------------------------- */}

      {prediction && (

        <Card
          sx={{
            borderRadius: 3,
            mb: 3,
          }}
        >

          <CardContent
            sx={{
              p: 4,
            }}
          >

            <Typography
              color="text.secondary"
              sx={{
                mb: 1,
              }}
            >
              Predicted Electricity Demand
            </Typography>


            <Typography
              variant="h2"
              fontWeight={700}
              sx={{
                mb: 1,
                color: "#172B4D",
              }}
            >

              {formatNumber(
                prediction.predicted_demand
              )}{" "}

              MW

            </Typography>


            <Typography
              color="text.secondary"
            >

              {prediction.state}
              {" • "}
              Year {prediction.year}

            </Typography>


            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
              }}
            >

              ML-based electricity demand
              prediction using the selected
              weather, calendar and historical
              demand inputs.

            </Typography>

          </CardContent>

        </Card>

      )}


      {/* -------------------------------------------- */}
      {/* MODEL INFORMATION */}
      {/* -------------------------------------------- */}

      <Card
        sx={{
          borderRadius: 3,
        }}
      >

        <CardContent
          sx={{
            p: 3,
          }}
        >

          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mb: 2,
            }}
          >
            Model Information
          </Typography>


          <Typography
            color="text.secondary"
          >

            The dashboard uses a trained
            Random Forest Regressor to predict
            electricity demand.

          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >

            The model uses state, year,
            weather conditions, calendar
            information and historical demand
            features.

          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >

            Enter any year to generate a
            demand estimate using the
            historical demand pattern as
            reference.

          </Typography>

        </CardContent>

      </Card>

    </Box>

  );

}


export default Prediction;