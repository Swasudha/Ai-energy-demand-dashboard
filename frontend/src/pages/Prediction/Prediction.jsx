import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import { predictDemand } from "../../services/api";

function Prediction() {
  const [formData, setFormData] = useState({
    state: "Tamil Nadu",
    temp_avg: 30,
    humidity: 65,
    rainfall: 0,
    month: 5,
    weekday: "Monday",
    season: "Summer",
    lag_1_demand: 16500,
    lag_7_demand: 16000,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const states = [
    "Andhra Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Tamil Nadu",
    "Telangana",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const seasons = [
    "Summer",
    "Monsoon",
    "Winter",
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const requestData = {
        state: formData.state,
        temp_avg: Number(formData.temp_avg),
        humidity: Number(formData.humidity),
        rainfall: Number(formData.rainfall),
        month: Number(formData.month),
        weekday: formData.weekday,
        season: formData.season,
        lag_1_demand: Number(formData.lag_1_demand),
        lag_7_demand: Number(formData.lag_7_demand),
      };

      const response = await predictDemand(requestData);

      setPrediction(response.data.predicted_demand);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to generate demand prediction."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Page heading */}
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
      >
        AI Demand Prediction
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Predict electricity demand using weather conditions,
        calendar information and historical demand.
      </Typography>

      {/* Input form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 3 }}
          >
            Prediction Inputs
          </Typography>

          <Grid container spacing={3}>
            {/* State */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>

                <Select
                  name="state"
                  value={formData.state}
                  label="State"
                  onChange={handleChange}
                >
                  {states.map((state) => (
                    <MenuItem
                      key={state}
                      value={state}
                    >
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Temperature */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Temperature (°C)"
                name="temp_avg"
                type="number"
                value={formData.temp_avg}
                onChange={handleChange}
              />
            </Grid>

            {/* Humidity */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Humidity (%)"
                name="humidity"
                type="number"
                value={formData.humidity}
                onChange={handleChange}
              />
            </Grid>

            {/* Rainfall */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rainfall (mm)"
                name="rainfall"
                type="number"
                value={formData.rainfall}
                onChange={handleChange}
              />
            </Grid>

            {/* Month */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>

                <Select
                  name="month"
                  value={formData.month}
                  label="Month"
                  onChange={handleChange}
                >
                  {Array.from(
                    { length: 12 },
                    (_, index) => index + 1
                  ).map((month) => (
                    <MenuItem
                      key={month}
                      value={month}
                    >
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Weekday */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Weekday</InputLabel>

                <Select
                  name="weekday"
                  value={formData.weekday}
                  label="Weekday"
                  onChange={handleChange}
                >
                  {weekdays.map((day) => (
                    <MenuItem
                      key={day}
                      value={day}
                    >
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Season */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Season</InputLabel>

                <Select
                  name="season"
                  value={formData.season}
                  label="Season"
                  onChange={handleChange}
                >
                  {seasons.map((season) => (
                    <MenuItem
                      key={season}
                      value={season}
                    >
                      {season}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Lag 1 */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Lag 1 Demand (MW)"
                name="lag_1_demand"
                type="number"
                value={formData.lag_1_demand}
                onChange={handleChange}
              />
            </Grid>

            {/* Lag 7 */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Lag 7 Demand (MW)"
                name="lag_7_demand"
                type="number"
                value={formData.lag_7_demand}
                onChange={handleChange}
              />
            </Grid>

            {/* Predict button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                onClick={handlePredict}
                disabled={loading}
                sx={{
                  minWidth: 200,
                  fontWeight: 700,
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    color="inherit"
                  />
                ) : (
                  "Predict Demand"
                )}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Prediction result */}
      {prediction !== null && (
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
            >
              Predicted Demand
            </Typography>

            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ mt: 2 }}
            >
              {Number(prediction).toLocaleString()} MW
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              AI-generated electricity demand prediction
              based on the provided inputs.
            </Typography>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: "action.hover",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
              >
                Model Information
              </Typography>

              <Typography color="text.secondary">
                Prediction generated using the trained
                demand forecasting model.
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Input features: weather, calendar and
                historical demand.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default Prediction;