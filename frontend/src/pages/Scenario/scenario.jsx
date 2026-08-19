import { useState } from 'react';
import {
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
  Alert,
  CircularProgress,
} from '@mui/material';

const API_URL = 'http://127.0.0.1:8000';

const states = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

function Scenario() {
  const [formData, setFormData] = useState({
    state: 'Tamil Nadu',
    currentTemperature: 30,
    scenarioTemperature: 35,
    humidity: 65,
    rainfall: 0,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === 'state'
          ? value
          : Number(value),
    }));
  };

  const runScenario = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/api/scenario`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            state: formData.state,
            date: new Date()
              .toISOString()
              .split('T')[0],
            current_temperature:
              formData.currentTemperature,
            scenario_temperature:
              formData.scenarioTemperature,
            humidity: formData.humidity,
            rainfall: formData.rainfall,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.detail ||
            'Unable to run scenario'
        );
      }

      const data = await response.json();

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          'Something went wrong while running the scenario.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value) => {
    return Number(value).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const getDifferenceColor = () => {
    if (!result) return 'text.primary';

    return result.difference >= 0
      ? 'error.main'
      : 'success.main';
  };

  const maxDemand = result
    ? Math.max(
        result.baselineDemand,
        result.scenarioDemand
      )
    : 1;

  const baselineHeight = result
    ? (result.baselineDemand / maxDemand) * 250
    : 0;

  const scenarioHeight = result
    ? (result.scenarioDemand / maxDemand) * 250
    : 0;

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 1,
          }}
        >
          What-if Scenario
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ fontSize: 17 }}
        >
          Explore how changes in temperature
          could impact electricity demand.
        </Typography>
      </Box>

      {/* Input Card */}
      <Card
        sx={{
          borderRadius: 4,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            Scenario Inputs
          </Typography>

          <Grid
            container
            spacing={2}
          >
            {/* State */}
            <Grid
              item
              xs={12}
              md={4}
            >
              <FormControl fullWidth>
                <InputLabel>
                  State
                </InputLabel>

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

            {/* Current Temperature */}
            <Grid
              item
              xs={12}
              md={4}
            >
              <TextField
                fullWidth
                label="Current Temperature (°C)"
                name="currentTemperature"
                type="number"
                value={
                  formData.currentTemperature
                }
                onChange={handleChange}
              />
            </Grid>

            {/* Scenario Temperature */}
            <Grid
              item
              xs={12}
              md={4}
            >
              <TextField
                fullWidth
                label="Scenario Temperature (°C)"
                name="scenarioTemperature"
                type="number"
                value={
                  formData.scenarioTemperature
                }
                onChange={handleChange}
              />
            </Grid>

            {/* Humidity */}
            <Grid
              item
              xs={12}
              md={4}
            >
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
            <Grid
              item
              xs={12}
              md={4}
            >
              <TextField
                fullWidth
                label="Rainfall (mm)"
                name="rainfall"
                type="number"
                value={formData.rainfall}
                onChange={handleChange}
              />
            </Grid>

            {/* Run Button */}
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={runScenario}
                disabled={loading}
                sx={{
                  height: 56,
                  fontWeight: 700,
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={25}
                    color="inherit"
                  />
                ) : (
                  'Run Scenario'
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

      {/* Results */}
      {result && (
        <>
          <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
          >
            {/* Baseline */}
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  height: '100%',
                }}
              >
                <CardContent>
                  <Typography
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Baseline Demand
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {formatNumber(
                      result.baselineDemand
                    )}{' '}
                    MW
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Current conditions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Scenario */}
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  height: '100%',
                }}
              >
                <CardContent>
                  <Typography
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Scenario Demand
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {formatNumber(
                      result.scenarioDemand
                    )}{' '}
                    MW
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Simulated conditions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Difference */}
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  height: '100%',
                }}
              >
                <CardContent>
                  <Typography
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Difference
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: getDifferenceColor(),
                    }}
                  >
                    {result.difference >= 0
                      ? '+'
                      : ''}
                    {formatNumber(
                      result.difference
                    )}{' '}
                    MW
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Demand change
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Percentage */}
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  height: '100%',
                }}
              >
                <CardContent>
                  <Typography
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Percentage Change
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color:
                        result.percentageChange >=
                        0
                          ? 'error.main'
                          : 'success.main',
                    }}
                  >
                    {result.percentageChange >=
                    0
                      ? '+'
                      : ''}
                    {formatNumber(
                      result.percentageChange
                    )}
                    %
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Relative demand change
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Comparison Chart */}
          <Card
            sx={{
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Baseline vs Scenario
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Comparison of electricity demand
                under current and simulated
                temperature conditions.
              </Typography>

              <Box
                sx={{
                  height: 330,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: 8,
                  borderBottom:
                    '1px solid',
                  borderColor:
                    'divider',
                  px: 4,
                }}
              >
                {/* Baseline Bar */}
                <Box
                  sx={{
                    height: baselineHeight,
                    width: 140,
                    backgroundColor:
                      'primary.main',
                    borderRadius:
                      '10px 10px 0 0',
                    position: 'relative',
                    minHeight: 30,
                  }}
                >
                  <Typography
                    sx={{
                      position:
                        'absolute',
                      top: -32,
                      width: '100%',
                      textAlign:
                        'center',
                      fontWeight: 700,
                    }}
                  >
                    {formatNumber(
                      result.baselineDemand
                    )}
                  </Typography>

                  <Typography
                    sx={{
                      position:
                        'absolute',
                      bottom: -35,
                      width: '100%',
                      textAlign:
                        'center',
                      fontWeight: 600,
                    }}
                  >
                    Baseline
                  </Typography>
                </Box>

                {/* Scenario Bar */}
                <Box
                  sx={{
                    height:
                      scenarioHeight,
                    width: 140,
                    backgroundColor:
                      'secondary.main',
                    borderRadius:
                      '10px 10px 0 0',
                    position: 'relative',
                    minHeight: 30,
                  }}
                >
                  <Typography
                    sx={{
                      position:
                        'absolute',
                      top: -32,
                      width: '100%',
                      textAlign:
                        'center',
                      fontWeight: 700,
                    }}
                  >
                    {formatNumber(
                      result.scenarioDemand
                    )}
                  </Typography>

                  <Typography
                    sx={{
                      position:
                        'absolute',
                      bottom: -35,
                      width: '100%',
                      textAlign:
                        'center',
                      fontWeight: 600,
                    }}
                  >
                    Scenario
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}

export default Scenario;