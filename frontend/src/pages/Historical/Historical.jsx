import { useEffect, useMemo, useState } from 'react';

import {
  Box,
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
} from '@mui/material';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualizerIcon from '@mui/icons-material/Equalizer';

import {
  getStates,
  getHistorical,
} from '../../services/api';


function Historical() {
  const [states, setStates] = useState([]);

  const [selectedState, setSelectedState] = useState('Tamil Nadu');

  const [historicalData, setHistoricalData] = useState(null);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // --------------------------------------------------
  // Load states
  // --------------------------------------------------

  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await getStates();

        console.log(
          'States API response:',
          response.data
        );

        const stateList = response.data.states || [];

        setStates(stateList);

        if (stateList.includes('Tamil Nadu')) {
          setSelectedState('Tamil Nadu');
        } else if (stateList.length > 0) {
          setSelectedState(stateList[0]);
        }
      } catch (err) {
        console.error(
          'States API error:',
          err
        );

        setError('Unable to load states.');
      }
    };

    loadStates();
  }, []);


  // --------------------------------------------------
  // Load historical data
  // --------------------------------------------------

  useEffect(() => {
    const loadHistorical = async () => {
      try {
        setLoading(true);
        setError('');

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
        setLoading(false);
      }
    };

    loadHistorical();
  }, []);


  // --------------------------------------------------
  // Filter daily data
  // --------------------------------------------------

  const dailyData = useMemo(() => {
    if (!historicalData?.daily) {
      return [];
    }

    let data = historicalData.daily.filter(
      (item) =>
        item.State === selectedState
    );

    if (fromDate) {
      data = data.filter(
        (item) =>
          item.Date >= fromDate
      );
    }

    if (toDate) {
      data = data.filter(
        (item) =>
          item.Date <= toDate
      );
    }

    return data
      .map((item) => ({
        date: item.Date,
        demand: Number(
          item.Daily_Demand_MW || 0
        ),
      }))
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );
  }, [
    historicalData,
    selectedState,
    fromDate,
    toDate,
  ]);


  // --------------------------------------------------
  // Filter monthly data
  // --------------------------------------------------

  const monthlyData = useMemo(() => {
    if (!historicalData?.monthly) {
      return [];
    }

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return historicalData.monthly
      .filter(
        (item) =>
          item.State === selectedState
      )
      .map((item) => ({
        month:
          monthNames[
            Number(item.Month) - 1
          ] || item.Month,
        demand: Number(
          item.Monthly_Demand_MW || 0
        ),
        monthNumber: Number(item.Month),
      }))
      .sort(
        (a, b) =>
          a.monthNumber -
          b.monthNumber
      );
  }, [
    historicalData,
    selectedState,
  ]);


  // --------------------------------------------------
  // Filter seasonal data
  // --------------------------------------------------

  const seasonalData = useMemo(() => {
    if (!historicalData?.seasonal) {
      return [];
    }

    return historicalData.seasonal
      .filter(
        (item) =>
          item.State === selectedState
      )
      .map((item) => ({
        season: item.Season,
        demand: Number(
          item.Seasonal_Demand_MW || 0
        ),
      }));
  }, [
    historicalData,
    selectedState,
  ]);


  // --------------------------------------------------
  // Calculate statistics
  // --------------------------------------------------

  const statistics = useMemo(() => {
    if (dailyData.length === 0) {
      return {
        highest: 0,
        lowest: 0,
        average: 0,
        highestDate: '',
        lowestDate: '',
      };
    }

    const demands = dailyData.map(
      (item) => item.demand
    );

    const highest = Math.max(...demands);
    const lowest = Math.min(...demands);

    const average =
      demands.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / demands.length;

    const highestItem =
      dailyData.find(
        (item) =>
          item.demand === highest
      );

    const lowestItem =
      dailyData.find(
        (item) =>
          item.demand === lowest
      );

    return {
      highest,
      lowest,
      average,
      highestDate:
        highestItem?.date || '',
      lowestDate:
        lowestItem?.date || '',
    };
  }, [dailyData]);


  // --------------------------------------------------
  // Format MW
  // --------------------------------------------------

  const formatMW = (value) => {
    if (!value) {
      return '—';
    }

    return `${Number(value).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 0,
      }
    )} MW`;
  };


  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }


  // --------------------------------------------------
  // Error state
  // --------------------------------------------------

  if (error) {
    return (
      <Typography color="error">
        {error}
      </Typography>
    );
  }


  return (
    <Box>

      {/* ========================================== */}
      {/* PAGE HEADER */}
      {/* ========================================== */}

      <Box sx={{ mb: 3 }}>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          <HistoryIcon color="primary" />

          <Typography
            variant="h4"
            fontWeight={700}
          >
            Historical Demand
          </Typography>
        </Box>

        <Typography color="text.secondary">
          Analyze historical electricity demand
          trends across Indian states.
        </Typography>

      </Box>


      {/* ========================================== */}
      {/* FILTERS */}
      {/* ========================================== */}

      <Card sx={{ mb: 3 }}>
        <CardContent>

          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 2 }}
          >
            Filters
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >

            {/* State */}

            <FormControl fullWidth>

              <InputLabel>
                State
              </InputLabel>

              <Select
                value={selectedState}
                label="State"
                onChange={(event) => {
                  setSelectedState(
                    event.target.value
                  );
                }}
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


            {/* From date */}
<TextField
  label="From Date"
  type="date"
  value={fromDate}
  onChange={(event) => {
    setFromDate(event.target.value);
  }}
  fullWidth
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
/>

<TextField
  label="To Date"
  type="date"
  value={toDate}
  onChange={(event) => {
    setToDate(event.target.value);
  }}
  fullWidth
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
/>

          </Box>

        </CardContent>
      </Card>


      {/* ========================================== */}
      {/* KPI CARDS */}
      {/* ========================================== */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >

        {/* Highest */}

        <Grid size={{ xs: 12, md: 4 }}>

          <Card>
            <CardContent>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <TrendingUpIcon color="primary" />

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Highest Demand
                </Typography>
              </Box>

              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mt: 2 }}
              >
                {formatMW(
                  statistics.highest
                )}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {statistics.highestDate ||
                  'No data'}
              </Typography>

            </CardContent>
          </Card>

        </Grid>


        {/* Lowest */}

        <Grid size={{ xs: 12, md: 4 }}>

          <Card>
            <CardContent>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <TrendingDownIcon color="primary" />

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Lowest Demand
                </Typography>
              </Box>

              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mt: 2 }}
              >
                {formatMW(
                  statistics.lowest
                )}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {statistics.lowestDate ||
                  'No data'}
              </Typography>

            </CardContent>
          </Card>

        </Grid>


        {/* Average */}

        <Grid size={{ xs: 12, md: 4 }}>

          <Card>
            <CardContent>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <EqualizerIcon color="primary" />

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Average Demand
                </Typography>
              </Box>

              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mt: 2 }}
              >
                {formatMW(
                  statistics.average
                )}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Based on selected date range
              </Typography>

            </CardContent>
          </Card>

        </Grid>

      </Grid>


      {/* ========================================== */}
      {/* DAILY DEMAND */}
      {/* ========================================== */}

      <Card sx={{ mb: 3 }}>

        <CardContent>

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Daily Demand
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Daily electricity demand for{' '}
            <strong>
              {selectedState}
            </strong>
          </Typography>

          {dailyData.length === 0 ? (

            <Box
              sx={{
                py: 8,
                textAlign: 'center',
              }}
            >
              <Typography color="text.secondary">
                No demand data available for
                the selected filters.
              </Typography>
            </Box>

          ) : (

            <Box
              sx={{
                width: '100%',
                height: 400,
              }}
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={dailyData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    label={{
                      value: 'MW',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="demand"
                    name="Demand (MW)"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </Box>

          )}

        </CardContent>

      </Card>


      {/* ========================================== */}
      {/* MONTHLY + SEASONAL */}
      {/* ========================================== */}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1fr 1fr',
          },
          gap: 3,
        }}
      >

        {/* Monthly */}

        <Card>

          <CardContent>

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Monthly Demand
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Monthly electricity demand
            </Typography>

            <Box
              sx={{
                width: '100%',
                height: 350,
              }}
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 20,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="demand"
                    name="Demand (MW)"
                    fill="#1976d2"
                  />

                </BarChart>

              </ResponsiveContainer>

            </Box>

          </CardContent>

        </Card>


        {/* Seasonal */}

        <Card>

          <CardContent>

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Seasonal Demand
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Electricity demand by season
            </Typography>

            <Box
              sx={{
                width: '100%',
                height: 350,
              }}
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={seasonalData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 20,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="season"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="demand"
                    name="Demand (MW)"
                    fill="#2e7d32"
                  />

                </BarChart>

              </ResponsiveContainer>

            </Box>

          </CardContent>

        </Card>

      </Box>

    </Box>
  );
}

export default Historical;