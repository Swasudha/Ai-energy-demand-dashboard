import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import {
  getStates,
  getHistorical,
  getWeatherImpact,
  getTariff,
  predictDemand,
  getCostAnalysis,
  getSavings,
} from '../../services/api';


function Dashboard() {

  // ==================================================
  // STATE
  // ==================================================

  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');

  const [historicalData, setHistoricalData] = useState(null);

  const [loadingStates, setLoadingStates] =
    useState(true);

  const [loadingHistorical, setLoadingHistorical] =
    useState(true);

  const [weatherImpact, setWeatherImpact] =
    useState(null);

  const [loadingWeather, setLoadingWeather] =
    useState(false);

  const [weatherError, setWeatherError] =
    useState('');

  const [error, setError] = useState('');

  // ==================================================
  // ANALYTICS
  // ==================================================

  const [predictedDemand, setPredictedDemand] =
    useState(null);

  const [predictionYear, setPredictionYear] =
    useState(null);

  const [tariff, setTariff] =
    useState(null);

  const [costAnalysis, setCostAnalysis] =
    useState(null);

  const [savings, setSavings] =
    useState(null);

  const [loadingAnalytics, setLoadingAnalytics] =
    useState(false);


  // ==================================================
  // LOAD STATES
  // ==================================================

  useEffect(() => {

    const loadStates = async () => {

      try {

        setLoadingStates(true);
        setError('');

        const response = await getStates();

        console.log(
          'States API response:',
          response.data
        );

        const stateList =
          response.data?.states || [];

        setStates(stateList);

        if (stateList.length > 0) {

          setSelectedState(
            (currentState) => {

              if (
                currentState &&
                stateList.includes(currentState)
              ) {
                return currentState;
              }

              return stateList[0];
            }
          );
        }

      } catch (err) {

        console.error(
          'States API error:',
          err
        );

        setError(
          err?.response?.data?.detail ||
          'Unable to load states.'
        );

      } finally {

        setLoadingStates(false);
      }
    };

    loadStates();

  }, []);


  // ==================================================
  // LOAD HISTORICAL DATA
  // ==================================================

  useEffect(() => {

    const loadHistorical = async () => {

      try {

        setLoadingHistorical(true);

        const response =
          await getHistorical();

        console.log(
          'Historical API response:',
          response.data
        );

        setHistoricalData(
          response.data
        );

      } catch (err) {

        console.error(
          'Historical API error:',
          err
        );

        setError(
          err?.response?.data?.detail ||
          'Unable to load historical demand data.'
        );

      } finally {

        setLoadingHistorical(false);
      }
    };

    loadHistorical();

  }, []);


  // ==================================================
  // LOAD WEATHER IMPACT
  // ==================================================

  useEffect(() => {

    if (!selectedState) {
      return;
    }

    const loadWeatherImpact = async () => {

      try {

        setLoadingWeather(true);
        setWeatherError('');

        const response =
          await getWeatherImpact(
            selectedState
          );

        console.log(
          'Weather Impact API response:',
          response.data
        );

        setWeatherImpact(
          response.data
        );

      } catch (err) {

        console.error(
          'Weather Impact API error:',
          err
        );

        setWeatherImpact(null);

        setWeatherError(
          err?.response?.data?.detail ||
          'Unable to load weather impact data.'
        );

      } finally {

        setLoadingWeather(false);
      }
    };

    loadWeatherImpact();

  }, [selectedState]);


  // ==================================================
  // SELECTED STATE DATA
  // ==================================================

  const selectedStateData = useMemo(() => {

    if (
      !historicalData?.daily ||
      !selectedState
    ) {
      return [];
    }

    return historicalData.daily
      .filter(
        (item) =>
          item.State === selectedState
      )
      .sort(
        (a, b) =>
          new Date(a.Date) -
          new Date(b.Date)
      );

  }, [
    historicalData,
    selectedState,
  ]);


  // ==================================================
  // CHART DATA
  // ==================================================

  const chartData = useMemo(() => {

    return selectedStateData.map(
      (item) => ({
        date: item.Date,

        demand:
          Number(
            item.Daily_Demand_MW
          ) || 0,
      })
    );

  }, [selectedStateData]);


  // ==================================================
  // CURRENT DEMAND
  // ==================================================

  const currentDemand = useMemo(() => {

    if (chartData.length === 0) {
      return null;
    }

    const latest =
      chartData[
        chartData.length - 1
      ];

    return latest.demand;

  }, [chartData]);


  // ==================================================
  // LATEST HISTORICAL RECORD
  // ==================================================

  const latestData = useMemo(() => {

    if (
      selectedStateData.length === 0
    ) {
      return null;
    }

    return selectedStateData[
      selectedStateData.length - 1
    ];

  }, [selectedStateData]);


  // ==================================================
  // ENERGY CONSUMPTION
  // ==================================================

  const energyConsumption =
    latestData?.Energy_Met_MU !== undefined
      ? Number(
          latestData.Energy_Met_MU
        )
      : null;


  // ==================================================
  // LOAD TARIFF + COST + SAVINGS
  // ==================================================

  useEffect(() => {

    if (!selectedState) {
      return;
    }

    const loadCostData = async () => {

      try {

        setLoadingAnalytics(true);

        setTariff(null);
        setCostAnalysis(null);
        setSavings(null);


        // ------------------------------------------
        // TARIFF
        // ------------------------------------------

        const tariffResponse =
          await getTariff(
            selectedState
          );

        console.log(
          'Tariff API response:',
          tariffResponse.data
        );

        setTariff(
          tariffResponse.data
        );


        // ------------------------------------------
        // COST
        // ------------------------------------------

        const costResponse =
          await getCostAnalysis(
            selectedState
          );

        console.log(
          'Cost API response:',
          costResponse.data
        );

        setCostAnalysis(
          costResponse.data
        );


        // ------------------------------------------
        // SAVINGS
        // ------------------------------------------

        const energyForSavings =
          Number(
            costResponse.data?.energyMU
          );

        if (
          Number.isFinite(
            energyForSavings
          )
        ) {

          const savingsResponse =
            await getSavings({

              state: selectedState,

              // IMPORTANT:
              // Must match FastAPI
              // SavingsRequest.
              currentEnergyMU:
                energyForSavings,

              reductionPercentage: 5,
            });

          console.log(
            'Savings API response:',
            savingsResponse.data
          );

          setSavings(
            savingsResponse.data
          );
        }

      } catch (err) {

        console.error(
          'Cost/Tariff/Savings API error:',
          err
        );

        console.error(
          'API error response:',
          err?.response?.data
        );

      } finally {

        setLoadingAnalytics(false);
      }
    };

    loadCostData();

  }, [selectedState]);


  // ==================================================
  // GET LATEST WEATHER OBSERVATION
  // ==================================================

  const latestWeather = useMemo(() => {

    const observations =
      weatherImpact?.observations;

    if (
      !Array.isArray(observations) ||
      observations.length === 0
    ) {
      return null;
    }

    return observations[
      observations.length - 1
    ];

  }, [weatherImpact]);


  // ==================================================
  // GET SEASON
  // ==================================================

  const getSeason = (month) => {

    if (
      month >= 3 &&
      month <= 5
    ) {
      return 'Summer';
    }

    if (
      month >= 6 &&
      month <= 9
    ) {
      return 'Monsoon';
    }

    if (
      month >= 10 &&
      month <= 11
    ) {
      return 'Post-Monsoon';
    }

    return 'Winter';
  };


  // ==================================================
  // ML PREDICTION
  // ==================================================

  useEffect(() => {

    if (
      !selectedState ||
      selectedStateData.length < 8 ||
      !latestWeather
    ) {

      setPredictedDemand(null);
      setPredictionYear(null);

      return;
    }


    const loadPrediction = async () => {

      try {

        // ------------------------------------------
        // LATEST HISTORICAL RECORD
        // ------------------------------------------

        const latestRecord =
          selectedStateData[
            selectedStateData.length - 1
          ];

        const latestDate =
          new Date(
            latestRecord.Date
          );


        // ------------------------------------------
        // PREDICT NEXT YEAR
        // ------------------------------------------

        const nextYear =
          latestDate.getFullYear() + 1;

        setPredictionYear(
          nextYear
        );


        // ------------------------------------------
        // MONTH
        // ------------------------------------------

        const month =
          latestDate.getMonth() + 1;


        // ------------------------------------------
        // WEEKDAY
        // ------------------------------------------

        const weekday =
          latestDate.toLocaleDateString(
            'en-US',
            {
              weekday: 'long',
            }
          );


        // ------------------------------------------
        // SEASON
        // ------------------------------------------

        const season =
          latestRecord.Season ||
          getSeason(month);


        // ------------------------------------------
        // LATEST DEMAND
        // ------------------------------------------

        const latestDemand =
          Number(
            latestRecord.Daily_Demand_MW
          );


        // ------------------------------------------
        // LAG 1
        // ------------------------------------------

        const lag1Record =
          selectedStateData[
            selectedStateData.length - 2
          ];

        const lag1Demand =
          Number(
            lag1Record?.Daily_Demand_MW
          );


        // ------------------------------------------
        // LAG 7
        // ------------------------------------------

        const lag7Record =
          selectedStateData[
            selectedStateData.length - 8
          ];

        const lag7Demand =
          Number(
            lag7Record?.Daily_Demand_MW
          );


        // ------------------------------------------
        // WEATHER
        // ------------------------------------------

        const temperature =
          Number(
            latestWeather.temperature ??
            latestWeather.Temp_Avg ??
            latestRecord.Temp_Avg
          );

        const humidity =
          Number(
            latestWeather.humidity ??
            latestRecord.Humidity
          );

        const rainfall =
          Number(
            latestWeather.rainfall ??
            latestRecord.Rainfall
          );


        // ------------------------------------------
        // VALIDATE INPUTS
        // ------------------------------------------

        if (
          !Number.isFinite(
            temperature
          ) ||
          !Number.isFinite(
            humidity
          ) ||
          !Number.isFinite(
            rainfall
          ) ||
          !Number.isFinite(
            lag1Demand
          ) ||
          !Number.isFinite(
            lag7Demand
          ) ||
          !Number.isFinite(
            latestDemand
          )
        ) {

          console.warn(
            'Prediction skipped because required values are missing.'
          );

          setPredictedDemand(null);

          return;
        }


        // ------------------------------------------
        // PREDICTION PAYLOAD
        // ------------------------------------------

        const payload = {

          state: selectedState,

          // IMPORTANT:
          // Send the year because the backend
          // PredictionRequest requires it.
          year: nextYear,

          temp_avg: temperature,

          humidity,

          rainfall,

          month,

          weekday,

          season,

          lag_1_demand:
            lag1Demand,

          lag_7_demand:
            lag7Demand,
        };


        console.log(
          'Prediction input:',
          payload
        );


        // ------------------------------------------
        // CALL ML API
        // ------------------------------------------

        const response =
          await predictDemand(
            payload
          );


        console.log(
          'Prediction API response:',
          response.data
        );


        // ------------------------------------------
        // SAVE PREDICTION
        // ------------------------------------------

        setPredictedDemand(
          response.data
            ?.predicted_demand ??
          null
        );

      } catch (err) {

        console.error(
          'Prediction API error:',
          err
        );

        console.error(
          'Prediction API response:',
          err?.response?.data
        );

        setPredictedDemand(null);
      }
    };


    loadPrediction();

  }, [
    selectedState,
    selectedStateData,
    latestWeather,
  ]);


  // ==================================================
  // FORMATTING HELPERS
  // ==================================================

  const formatNumber = (
    value,
    decimals = 2
  ) => {

    if (
      value === null ||
      value === undefined ||
      !Number.isFinite(
        Number(value)
      )
    ) {
      return '—';
    }

    return Number(value)
      .toLocaleString(
        'en-IN',
        {
          maximumFractionDigits:
            decimals,
        }
      );
  };


  const formatCrore = (value) => {

    if (
      value === null ||
      value === undefined ||
      !Number.isFinite(
        Number(value)
      )
    ) {
      return '—';
    }

    return `₹${(
      Number(value) / 10000000
    ).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 2,
      }
    )} Cr`;
  };


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <Box
      sx={{
        p: 3,
        backgroundColor: '#F5F7FA',
        minHeight: '100%',
      }}
    >

      {/* ============================================
          PAGE HEADER
      ============================================= */}

      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          mb: 1,
          color: '#172B4D',
        }}
      >
        Overview
      </Typography>


      <Typography
        variant="body1"
        sx={{
          mb: 3,
          color: '#172B4D',
        }}
      >
        AI-powered electricity demand
        intelligence for Indian states
      </Typography>


      {/* ============================================
          STATE SELECTOR
      ============================================= */}

      <FormControl
        sx={{
          minWidth: 330,
          mb: 3,
        }}
        size="small"
      >

        <InputLabel id="dashboard-state-label">
          State
        </InputLabel>

        <Select
          labelId="dashboard-state-label"
          value={selectedState}
          label="State"
          onChange={(event) => {

            setSelectedState(
              event.target.value
            );

          }}
          disabled={
            loadingStates ||
            states.length === 0
          }
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


      {/* ============================================
          SELECTED STATE
      ============================================= */}

      {selectedState && (

        <Typography
          variant="body1"
          sx={{
            mb: 3,
            color: '#172B4D',
          }}
        >
          Showing analytics for{' '}
          <strong>
            {selectedState}
          </strong>
        </Typography>

      )}


      {/* ============================================
          KPI CARDS
      ============================================= */}

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns:
            'repeat(5, minmax(0, 1fr))',

          gap: 2,

          mb: 3,

          '@media (max-width: 1200px)': {
            gridTemplateColumns:
              'repeat(3, minmax(0, 1fr))',
          },

          '@media (max-width: 700px)': {
            gridTemplateColumns:
              'repeat(1, minmax(0, 1fr))',
          },
        }}
      >

        {/* ========================================
            CURRENT DEMAND
        ========================================= */}

        <Card>

          <CardContent>

            <Typography
              variant="body2"
              sx={{
                mb: 2,
              }}
            >
              Current Demand
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >

              {currentDemand !== null
                ? `${(
                    currentDemand / 1000
                  ).toFixed(1)} GW`
                : '—'}

            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: 'text.secondary',
              }}
            >
              Latest historical demand
            </Typography>

          </CardContent>

        </Card>


        {/* ========================================
            PREDICTED DEMAND
        ========================================= */}

        <Card>

          <CardContent>

            <Typography
              variant="body2"
              sx={{
                mb: 2,
              }}
            >
              Predicted Demand
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >

              {predictedDemand !== null
                ? `${(
                    predictedDemand / 1000
                  ).toFixed(1)} GW`
                : '—'}

            </Typography>


            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: 'text.secondary',
              }}
            >

              {predictionYear
                ? `ML prediction for ${predictionYear}`
                : 'ML-based demand prediction'}

            </Typography>

          </CardContent>

        </Card>


        {/* ========================================
            ENERGY CONSUMPTION
        ========================================= */}

        <Card>

          <CardContent>

            <Typography
              variant="body2"
              sx={{
                mb: 2,
              }}
            >
              Energy Consumption
            </Typography>


            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >

              {energyConsumption !== null
                ? `${formatNumber(
                    energyConsumption,
                    2
                  )} MU`
                : costAnalysis?.energyMU !==
                    undefined
                ? `${formatNumber(
                    costAnalysis.energyMU,
                    2
                  )} MU`
                : '—'}

            </Typography>


            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: 'text.secondary',
              }}
            >
              Energy met from historical data
            </Typography>

          </CardContent>

        </Card>


        {/* ========================================
            ESTIMATED COST
        ========================================= */}

        <Card>

          <CardContent>

            <Typography
              variant="body2"
              sx={{
                mb: 2,
              }}
            >
              Estimated Cost
            </Typography>


            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >

              {loadingAnalytics
                ? 'Loading...'
                : formatCrore(
                    costAnalysis
                      ?.estimatedCost
                  )}

            </Typography>


            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: 'text.secondary',
              }}
            >

              Reference tariff:{' '}

              {tariff?.tariff !== null &&
              tariff?.tariff !== undefined
                ? `₹${tariff.tariff}/kWh`
                : costAnalysis?.tariffRsPerKWh !==
                    undefined
                ? `₹${costAnalysis.tariffRsPerKWh}/kWh`
                : '—'}

            </Typography>

          </CardContent>

        </Card>


        {/* ========================================
            POTENTIAL SAVINGS
        ========================================= */}

        <Card>

          <CardContent>

            <Typography
              variant="body2"
              sx={{
                mb: 2,
              }}
            >
              Potential Savings
            </Typography>


            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >

              {loadingAnalytics
                ? 'Loading...'
                : formatCrore(
                    savings
                      ?.potentialCostSaving
                  )}

            </Typography>


            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: 'text.secondary',
              }}
            >
              Potential saving at 5% reduction
            </Typography>

          </CardContent>

        </Card>

      </Box>


      {/* ============================================
          COST / TARIFF SUMMARY
      ============================================= */}

      {tariff && (

        <Card
          sx={{
            mb: 3,
          }}
        >

          <CardContent>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              State Cost Reference
            </Typography>


            <Typography
              variant="body1"
            >

              {selectedState} reference
              tariff:{' '}

              <strong>

                {tariff.tariff !== null &&
                tariff.tariff !== undefined
                  ? `₹${tariff.tariff}/kWh`
                  : 'Not available'}

              </strong>

            </Typography>


            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: 'text.secondary',
              }}
            >

              {tariff.type ||
                'Representative tariff reference'}

              {tariff.source
                ? ` • Source: ${tariff.source}`
                : ''}

            </Typography>


            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: 'text.secondary',
              }}
            >
              Cost and savings are estimates
              based on the selected state
              reference tariff.
            </Typography>

          </CardContent>

        </Card>

      )}


      {/* ============================================
          CHART + WEATHER
      ============================================= */}

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns:
            'minmax(0, 2fr) minmax(300px, 1fr)',

          gap: 2,

          '@media (max-width: 900px)': {
            gridTemplateColumns: '1fr',
          },
        }}
      >


        {/* ========================================
            DEMAND TREND
        ========================================= */}

        <Card>

          <CardContent>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              Demand Trend
            </Typography>


            <Typography
              variant="body2"
              sx={{
                mb: 3,
                color: 'text.secondary',
              }}
            >
              Daily electricity demand for
              selected state
            </Typography>


            <Box
              sx={{
                width: '100%',
                height: 350,
              }}
            >

              {loadingHistorical ? (

                <Typography>
                  Loading demand data...
                </Typography>

              ) : chartData.length === 0 ? (

                <Typography>
                  No demand data available
                </Typography>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 10,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                      }}
                      label={{
                        value: 'MW',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="demand"
                      strokeWidth={2}
                      dot={false}
                      name="Demand (MW)"
                    />

                  </LineChart>

                </ResponsiveContainer>

              )}

            </Box>

          </CardContent>

        </Card>


        {/* ========================================
            WEATHER IMPACT
        ========================================= */}

        <Card>

          <CardContent>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              Weather Impact
            </Typography>


            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mb: 3,
              }}
            >
              Weather variables affecting
              electricity demand for{' '}
              {selectedState}.
            </Typography>


            {loadingWeather && (

              <Typography>
                Loading weather impact...
              </Typography>

            )}


            {!loadingWeather &&
              weatherError && (

                <Typography
                  color="error"
                >
                  {weatherError}
                </Typography>

              )}


            {!loadingWeather &&
              !weatherError &&
              weatherImpact && (

                <Stack spacing={3}>

                  {/* TEMPERATURE */}

                  <Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      🌡️ Temperature
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Correlation:{' '}

                      <strong>

                        {weatherImpact
                          .temperature_correlation ??
                          weatherImpact
                            .temp_correlation ??
                          'N/A'}

                      </strong>

                    </Typography>

                  </Box>


                  {/* HUMIDITY */}

                  <Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      💧 Humidity
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Correlation:{' '}

                      <strong>

                        {weatherImpact
                          .humidity_correlation ??
                          'N/A'}

                      </strong>

                    </Typography>

                  </Box>


                  {/* RAINFALL */}

                  <Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      🌧️ Rainfall
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Correlation:{' '}

                      <strong>

                        {weatherImpact
                          .rainfall_correlation ??
                          'N/A'}

                      </strong>

                    </Typography>

                  </Box>

                </Stack>

              )}


            {!loadingWeather &&
              !weatherError &&
              !weatherImpact && (

                <Typography
                  color="text.secondary"
                >
                  No weather impact data
                  available.
                </Typography>

              )}

          </CardContent>

        </Card>

      </Box>


      {/* ============================================
          AI INSIGHTS
      ============================================= */}

      <Card
        sx={{
          mt: 2,
        }}
      >

        <CardContent>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            AI Insights
          </Typography>


          <Stack spacing={1.5}>

            <Typography>
              ⚠️ High demand detection is
              available through the Anomalies
              module.
            </Typography>


            <Typography>
              🌡️ Temperature impact is
              calculated from historical
              weather and demand data.
            </Typography>


            <Typography>
              📈 Demand prediction uses the
              trained Random Forest ML model
              with weather, calendar, year and
              historical demand features.
            </Typography>


            {predictionYear && (
              <Typography>
                📅 The dashboard is currently
                estimating demand for{' '}
                <strong>
                  {predictionYear}
                </strong>{' '}
                using the latest historical
                demand pattern as reference.
              </Typography>
            )}


            {savings && (

              <Typography>

                💰 A 5% energy reduction
                scenario could potentially
                save{' '}

                <strong>
                  {formatCrore(
                    savings
                      .potentialCostSaving
                  )}
                </strong>{' '}

                under the selected state
                tariff.

              </Typography>

            )}

          </Stack>

        </CardContent>

      </Card>


      {/* ============================================
          ERROR
      ============================================= */}

      {error && (

        <Typography
          sx={{
            mt: 2,
            color: 'error.main',
          }}
        >
          {error}
        </Typography>

      )}


      {/* ============================================
          COST DISCLAIMER
      ============================================= */}

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mt: 3,
          color: 'text.secondary',
        }}
      >
        Estimated cost only: cost estimates
        use the selected state's reference
        tariff and dataset energy values.
        Actual electricity costs may vary
        based on tariff category, slabs,
        fixed charges, taxes, subsidies,
        surcharges, and utility-specific
        billing rules.
      </Typography>

    </Box>

  );
}


export default Dashboard;