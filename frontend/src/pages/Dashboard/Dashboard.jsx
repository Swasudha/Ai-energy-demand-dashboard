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
} from '../../services/api';


function Dashboard() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');

  const [historicalData, setHistoricalData] = useState(null);

  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingHistorical, setLoadingHistorical] = useState(true);

  const [weatherImpact, setWeatherImpact] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  const [error, setError] = useState('');

  /*
   * Load states
   */
  useEffect(() => {
    const loadStates = async () => {
      try {
        setLoadingStates(true);

        const response = await getStates();

        console.log('States API response:', response.data);

        const stateList = response.data?.states || [];

        setStates(stateList);

        if (stateList.length > 0) {
          setSelectedState((currentState) => {
            if (currentState && stateList.includes(currentState)) {
              return currentState;
            }

            return stateList[0];
          });
        }
      } catch (err) {
        console.error('States API error:', err);

        setError('Unable to load states.');
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, []);


  /*
   * Load historical data
   */
  useEffect(() => {
    const loadHistorical = async () => {
      try {
        setLoadingHistorical(true);

        const response = await getHistorical();

        console.log(
          'Historical API response:',
          response.data
        );

        setHistoricalData(response.data);
      } catch (err) {
        console.error(
          'Historical API error:',
          err
        );

        setError(
          'Unable to load historical demand data.'
        );
      } finally {
        setLoadingHistorical(false);
      }
    };

    loadHistorical();
  }, []);

  /*
   * Load weather impact data
   */
  useEffect(() => {
    if (!selectedState) {
      return;
    }

    const loadWeatherImpact = async () => {
      try {
        setLoadingWeather(true);
        setWeatherError('');

        const response = await getWeatherImpact(
          selectedState
        );

        console.log(
          'Weather Impact API response:',
          response.data
        );

        setWeatherImpact(response.data);
      } catch (err) {
        console.error(
          'Weather Impact API error:',
          err
        );

        setWeatherImpact(null);

        setWeatherError(
          'Unable to load weather impact data.'
        );
      } finally {
        setLoadingWeather(false);
      }
    };

    loadWeatherImpact();
  }, [selectedState]);  


  /*
   * Prepare daily chart data
   */
  const chartData = useMemo(() => {
    if (!historicalData || !selectedState) {
      return [];
    }

    let dailyData = historicalData.daily || [];

    /*
     * If API returns data for multiple states,
     * filter by selected state.
     */
    if (
      dailyData.length > 0 &&
      dailyData[0].State !== undefined
    ) {
      dailyData = dailyData.filter(
        (item) =>
          item.State === selectedState
      );
    }

    /*
     * Convert API data into chart format.
     */
    return dailyData.map((item) => ({
      date: item.Date,
      demand:
        Number(item.Daily_Demand_MW) || 0,
    }));
  }, [
    historicalData,
    selectedState,
  ]);


  /*
   * Current demand
   *
   * Take the latest daily demand.
   */
  const currentDemand = useMemo(() => {
    if (chartData.length === 0) {
      return null;
    }

    const latest =
      chartData[chartData.length - 1];

    return latest.demand;
  }, [chartData]);


  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: '#F5F7FA',
        minHeight: '100%',
      }}
    >

      {/* Page Header */}

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
        AI-powered electricity demand intelligence
        for Indian states
      </Typography>


      {/* State Selector */}

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


      {/* KPI CARDS */}

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

        {/* Current Demand */}

        <Card>
          <CardContent>
            <Typography
              variant="body2"
              sx={{ mb: 2 }}
            >
              Current Demand
            </Typography>

            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              {currentDemand !== null
                ? `${(
                    currentDemand / 1000
                  ).toFixed(1)} GW`
                : '—'}
            </Typography>
          </CardContent>
        </Card>


        {/* Predicted Demand */}

        <Card>
          <CardContent>
            <Typography
              variant="body2"
              sx={{ mb: 2 }}
            >
              Predicted Demand
            </Typography>

            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              —
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: 'text.secondary',
              }}
            >
              AI prediction will be connected
              from the Prediction module.
            </Typography>
          </CardContent>
        </Card>


        {/* Energy Consumption */}

        <Card>
          <CardContent>
            <Typography
              variant="body2"
              sx={{ mb: 2 }}
            >
              Energy Consumption
            </Typography>

            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              —
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: 'text.secondary',
              }}
            >
              Energy consumption will be
              connected from Energy Met data.
            </Typography>
          </CardContent>
        </Card>


        {/* Estimated Cost */}

        <Card>
          <CardContent>
            <Typography
              variant="body2"
              sx={{ mb: 2 }}
            >
              Estimated Cost
            </Typography>

            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              —
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: 'text.secondary',
              }}
            >
              Cost analysis will be connected
              from the Cost & Savings module.
            </Typography>
          </CardContent>
        </Card>


        {/* Potential Savings */}

        <Card>
          <CardContent>
            <Typography
              variant="body2"
              sx={{ mb: 2 }}
            >
              Potential Savings
            </Typography>

            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              —
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: 'text.secondary',
              }}
            >
              Savings analysis will be connected
              from the Cost & Savings module.
            </Typography>
          </CardContent>
        </Card>

      </Box>


      {/* CHART + WEATHER */}

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

        {/* Demand Trend */}

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
              Daily electricity demand for selected
              state
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


        {/* Weather Impact */}
{/* Weather Impact */}

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
      Weather variables affecting electricity
      demand for {selectedState}.
    </Typography>

    {loadingWeather && (
      <Typography>
        Loading weather impact...
      </Typography>
    )}

    {!loadingWeather && weatherError && (
      <Typography color="error">
        {weatherError}
      </Typography>
    )}

    {!loadingWeather &&
      !weatherError &&
      weatherImpact && (
        <Stack spacing={3}>

          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600 }}
            >
              🌡️ Temperature
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Correlation:{' '}
              <strong>
                {weatherImpact.temperature_correlation ??
                  weatherImpact.temp_correlation ??
                  'N/A'}
              </strong>
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600 }}
            >
              💧 Humidity
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Correlation:{' '}
              <strong>
                {weatherImpact.humidity_correlation ??
                  'N/A'}
              </strong>
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600 }}
            >
              🌧️ Rainfall
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Correlation:{' '}
              <strong>
                {weatherImpact.rainfall_correlation ??
                  'N/A'}
              </strong>
            </Typography>
          </Box>

        </Stack>
      )}

    {!loadingWeather &&
      !weatherError &&
      !weatherImpact && (
        <Typography color="text.secondary">
          No weather impact data available.
        </Typography>
      )}

  </CardContent>
</Card>

      </Box>


      {/* AI INSIGHTS */}

      <Card sx={{ mt: 2 }}>
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
              ⚠️ High demand detection will be
              available through the Anomalies module.
            </Typography>

            <Typography>
              🌡️ Temperature impact will be
              available through the Weather Impact
              module.
            </Typography>

            <Typography>
              📈 Demand prediction will be available
              through the AI Prediction module.
            </Typography>

          </Stack>

        </CardContent>
      </Card>


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

    </Box>
  );
}

export default Dashboard;