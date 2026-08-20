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
  // ============================================================
  // FORM DATA
  // ============================================================

  const [formData, setFormData] = useState({
    state: 'Tamil Nadu',

    // NEW
    year: 2026,

    currentTemperature: 30,
    scenarioTemperature: 35,
    humidity: 65,
    rainfall: 0,
  });

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

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

  // ============================================================
  // RUN SCENARIO
  // ============================================================

  const runScenario = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // --------------------------------------------------------
      // VALIDATION
      // --------------------------------------------------------

      if (
        !formData.year ||
        formData.year < 1900 ||
        formData.year > 2200
      ) {
        throw new Error(
          'Please enter a valid year between 1900 and 2200.'
        );
      }

      if (
        Number.isNaN(formData.currentTemperature) ||
        Number.isNaN(formData.scenarioTemperature)
      ) {
        throw new Error(
          'Please enter valid temperature values.'
        );
      }

      if (
        Number.isNaN(formData.humidity) ||
        Number.isNaN(formData.rainfall)
      ) {
        throw new Error(
          'Please enter valid humidity and rainfall values.'
        );
      }

      // --------------------------------------------------------
      // API REQUEST
      // --------------------------------------------------------

      const response = await fetch(
        `${API_URL}/api/scenario`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            state: formData.state,

            // NEW
            year: formData.year,

            current_temperature:
              formData.currentTemperature,

            scenario_temperature:
              formData.scenarioTemperature,

            humidity:
              formData.humidity,

            rainfall:
              formData.rainfall,
          }),
        }
      );

      // --------------------------------------------------------
      // ERROR HANDLING
      // --------------------------------------------------------

      if (!response.ok) {
        let errorMessage =
          'Unable to run scenario';

        try {
          const errorData =
            await response.json();

          errorMessage =
            errorData.detail ||
            errorMessage;
        } catch {
          errorMessage =
            `Server returned ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      // --------------------------------------------------------
      // RESPONSE
      // --------------------------------------------------------

      const data =
        await response.json();

      console.log(
        'Scenario response:',
        data
      );

      setResult(data);

    } catch (err) {
      console.error(
        'Scenario error:',
        err
      );

      setError(
        err.message ||
          'Something went wrong while running the scenario.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORMAT NUMBER
  // ============================================================

  const formatNumber = (value) => {
    return Number(value).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // ============================================================
  // DIFFERENCE COLOR
  // ============================================================

  const getDifferenceColor = () => {
    if (!result) {
      return 'text.primary';
    }

    return result.difference >= 0
      ? 'error.main'
      : 'success.main';
  };

  // ============================================================
  // CHART CALCULATIONS
  // ============================================================

  const maxDemand = result
    ? Math.max(
        result.baselineDemand,
        result.scenarioDemand
      )
    : 1;

  const chartMaxHeight = 220;

  const baselineHeight = result
    ? Math.max(
        (result.baselineDemand /
          maxDemand) *
          chartMaxHeight,
        30
      )
    : 0;

  const scenarioHeight = result
    ? Math.max(
        (result.scenarioDemand /
          maxDemand) *
          chartMaxHeight,
        30
      )
    : 0;

  // ============================================================
  // UI
  // ============================================================

  return (
    <Box
      sx={{
        width: '100%',
      }}
    >

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <Box sx={{ mb: 3 }}>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 1,

            fontSize: {
              xs: '2rem',
              md: '3rem',
            },
          }}
        >
          What-if Scenario
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            fontSize: {
              xs: 15,
              md: 17,
            },
          }}
        >
          Explore how changes in temperature
          could impact electricity demand.
        </Typography>

      </Box>


      {/* ======================================================
          INPUT CARD
      ====================================================== */}

      <Card
        sx={{
          borderRadius: 4,
          mb: 3,
          overflow: 'visible',
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

            {/* ==================================================
                STATE
            ================================================== */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
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


            {/* ==================================================
                YEAR
            ================================================== */}

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
  value={formData.year}
  onChange={handleChange}
  slotProps={{
    htmlInput: {
      min: 1900,
      max: 2200,
    },
  }}
  helperText="Enter any year"
/>

            </Grid>


            {/* ==================================================
                CURRENT TEMPERATURE
            ================================================== */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
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


            {/* ==================================================
                SCENARIO TEMPERATURE
            ================================================== */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
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


            {/* ==================================================
                HUMIDITY
            ================================================== */}

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

                onChange={handleChange}
              />

            </Grid>


            {/* ==================================================
                RAINFALL
            ================================================== */}

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

                onChange={handleChange}
              />

            </Grid>


            {/* ==================================================
                RUN BUTTON
            ================================================== */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
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
                  borderRadius: 2,
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


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>

      )}


      {/* ======================================================
          RESULTS
      ====================================================== */}

      {result && (

        <>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <Grid
            container
            spacing={2}
            sx={{
              mb: 3,
            }}
          >

            {/* ==================================================
                BASELINE
            ================================================== */}

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

                <CardContent
                  sx={{
                    p: {
                      xs: 2,
                      md: 2.5,
                    },
                  }}
                >

                  <Typography
                    color="text.secondary"
                    sx={{
                      mb: 1,
                    }}
                  >
                    Baseline Demand
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,

                      fontSize: {
                        xs: '1.7rem',
                        md: '2rem',
                      },
                    }}
                  >

                    {formatNumber(
                      result.baselineDemand
                    )}{' '}

                    MW

                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 1,
                    }}
                  >
                    Current conditions
                  </Typography>

                </CardContent>

              </Card>

            </Grid>


            {/* ==================================================
                SCENARIO
            ================================================== */}

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

                <CardContent
                  sx={{
                    p: {
                      xs: 2,
                      md: 2.5,
                    },
                  }}
                >

                  <Typography
                    color="text.secondary"
                    sx={{
                      mb: 1,
                    }}
                  >
                    Scenario Demand
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,

                      fontSize: {
                        xs: '1.7rem',
                        md: '2rem',
                      },
                    }}
                  >

                    {formatNumber(
                      result.scenarioDemand
                    )}{' '}

                    MW

                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 1,
                    }}
                  >
                    Simulated conditions
                  </Typography>

                </CardContent>

              </Card>

            </Grid>


            {/* ==================================================
                DIFFERENCE
            ================================================== */}

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

                <CardContent
                  sx={{
                    p: {
                      xs: 2,
                      md: 2.5,
                    },
                  }}
                >

                  <Typography
                    color="text.secondary"
                    sx={{
                      mb: 1,
                    }}
                  >
                    Difference
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,

                      color:
                        getDifferenceColor(),

                      fontSize: {
                        xs: '1.7rem',
                        md: '2rem',
                      },
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
                    sx={{
                      mt: 1,
                    }}
                  >
                    Demand change
                  </Typography>

                </CardContent>

              </Card>

            </Grid>


            {/* ==================================================
                PERCENTAGE
            ================================================== */}

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

                <CardContent
                  sx={{
                    p: {
                      xs: 2,
                      md: 2.5,
                    },
                  }}
                >

                  <Typography
                    color="text.secondary"
                    sx={{
                      mb: 1,
                    }}
                  >
                    Percentage Change
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,

                      color:
                        result.percentageChange >= 0
                          ? 'error.main'
                          : 'success.main',

                      fontSize: {
                        xs: '1.7rem',
                        md: '2rem',
                      },
                    }}
                  >

                    {result.percentageChange >= 0
                      ? '+'
                      : ''}

                    {formatNumber(
                      result.percentageChange
                    )}

                    %

                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 1,
                    }}
                  >
                    Relative demand change
                  </Typography>

                </CardContent>

              </Card>

            </Grid>

          </Grid>


          {/* ==================================================
              COMPARISON CHART
          ================================================== */}

          <Card
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
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

              {/* ==================================================
                  CHART HEADER
              ================================================== */}

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
                sx={{
                  mb: 3,

                  fontSize: {
                    xs: 14,
                    md: 16,
                  },
                }}
              >
                Comparison of electricity demand
                under current and simulated
                temperature conditions for{' '}

                <strong>
                  {formData.year}
                </strong>.

              </Typography>


              {/* ==================================================
                  CHART
              ================================================== */}

              <Box
                sx={{
                  width: '100%',

                  height: {
                    xs: 310,
                    md: 340,
                  },

                  display: 'flex',

                  alignItems:
                    'flex-end',

                  justifyContent:
                    'center',

                  gap: {
                    xs: 5,
                    sm: 8,
                    md: 12,
                  },

                  borderBottom:
                    '1px solid',

                  borderColor:
                    'divider',

                  px: {
                    xs: 1,
                    md: 4,
                  },

                  pb: 2,
                }}
              >

                {/* ==================================================
                    BASELINE GROUP
                ================================================== */}

                <Box
                  sx={{
                    height: '100%',

                    width: {
                      xs: 110,
                      sm: 140,
                      md: 170,
                    },

                    display: 'flex',

                    flexDirection:
                      'column',

                    justifyContent:
                      'flex-end',

                    alignItems:
                      'center',
                  }}
                >

                  {/* VALUE */}

                  <Typography
                    sx={{
                      fontWeight: 700,

                      fontSize: {
                        xs: 13,
                        md: 15,
                      },

                      mb: 1,

                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    {formatNumber(
                      result.baselineDemand
                    )}

                  </Typography>


                  {/* BAR */}

                  <Box
                    sx={{
                      width: {
                        xs: 75,
                        sm: 100,
                        md: 120,
                      },

                      height:
                        baselineHeight,

                      backgroundColor:
                        'primary.main',

                      borderRadius:
                        '10px 10px 0 0',

                      transition:
                        'height 0.4s ease',

                      minHeight: 30,
                    }}
                  />


                  {/* LABEL */}

                  <Typography
                    sx={{
                      fontWeight: 600,

                      fontSize: {
                        xs: 13,
                        md: 15,
                      },

                      mt: 1.5,
                    }}
                  >
                    Baseline
                  </Typography>

                </Box>


                {/* ==================================================
                    SCENARIO GROUP
                ================================================== */}

                <Box
                  sx={{
                    height: '100%',

                    width: {
                      xs: 110,
                      sm: 140,
                      md: 170,
                    },

                    display: 'flex',

                    flexDirection:
                      'column',

                    justifyContent:
                      'flex-end',

                    alignItems:
                      'center',
                  }}
                >

                  {/* VALUE */}

                  <Typography
                    sx={{
                      fontWeight: 700,

                      fontSize: {
                        xs: 13,
                        md: 15,
                      },

                      mb: 1,

                      whiteSpace:
                        'nowrap',
                    }}
                  >

                    {formatNumber(
                      result.scenarioDemand
                    )}

                  </Typography>


                  {/* BAR */}

                  <Box
                    sx={{
                      width: {
                        xs: 75,
                        sm: 100,
                        md: 120,
                      },

                      height:
                        scenarioHeight,

                      backgroundColor:
                        'secondary.main',

                      borderRadius:
                        '10px 10px 0 0',

                      transition:
                        'height 0.4s ease',

                      minHeight: 30,
                    }}
                  />


                  {/* LABEL */}

                  <Typography
                    sx={{
                      fontWeight: 600,

                      fontSize: {
                        xs: 13,
                        md: 15,
                      },

                      mt: 1.5,
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