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
  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [states, setStates] = useState([]);

  const [selectedState, setSelectedState] =
    useState('Tamil Nadu');

  const [historicalData, setHistoricalData] =
    useState(null);

  const [fromDate, setFromDate] =
    useState('');

  const [toDate, setToDate] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  // --------------------------------------------------
  // LOAD STATES
  // --------------------------------------------------

  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await getStates();

        console.log(
          'States API response:',
          response.data
        );

        const stateList =
          response.data?.states || [];

        setStates(stateList);

        if (
          stateList.includes('Tamil Nadu')
        ) {
          setSelectedState('Tamil Nadu');
        } else if (
          stateList.length > 0
        ) {
          setSelectedState(stateList[0]);
        }

      } catch (err) {
        console.error(
          'States API error:',
          err
        );

        setError(
          'Unable to load states.'
        );
      }
    };

    loadStates();
  }, []);


  // --------------------------------------------------
  // LOAD HISTORICAL DATA
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedState) {
      return;
    }

    const loadHistorical = async () => {
      try {
        setLoading(true);
        setError('');

        /*
         * IMPORTANT:
         *
         * Send the selected state to the backend.
         *
         * Backend:
         * GET /api/historical?state=Tamil%20Nadu
         */
        const response =
          await getHistorical(
            selectedState
          );

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

        setHistoricalData(null);

        setError(
          'Unable to load historical demand data.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistorical();

  }, [selectedState]);


  // --------------------------------------------------
  // NORMALIZE DATE
  // --------------------------------------------------

  const normalizeDate = (value) => {
    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value).substring(
        0,
        10
      );
    }

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };


  // --------------------------------------------------
  // FILTER DAILY DATA
  // --------------------------------------------------

  const dailyData = useMemo(() => {
    if (
      !historicalData?.daily
    ) {
      return [];
    }

    let data =
      historicalData.daily;

    /*
     * DO NOT FILTER USING item.State HERE.
     *
     * The backend already filtered the dataset
     * using selectedState.
     */

    // ------------------------------------------------
    // Normalize daily records
    // ------------------------------------------------

    data = data
      .map((item) => {
        const date =
          normalizeDate(
            item.Date ??
            item.date
          );

        const demandValue =
          item.Daily_Demand_MW ??
          item.daily_demand_mw ??
          item.Demand_MW ??
          item.demand ??
          item.Max_Demand_Met_MW;

        return {
          date,
          demand:
            Number(demandValue) || 0,
        };
      })
      .filter(
        (item) =>
          item.date &&
          item.demand > 0
      );


    // ------------------------------------------------
    // From date
    // ------------------------------------------------

    if (fromDate) {
      data =
        data.filter(
          (item) =>
            item.date >= fromDate
        );
    }


    // ------------------------------------------------
    // To date
    // ------------------------------------------------

    if (toDate) {
      data =
        data.filter(
          (item) =>
            item.date <= toDate
        );
    }


    // ------------------------------------------------
    // Sort
    // ------------------------------------------------

    return data.sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );

  }, [
    historicalData,
    fromDate,
    toDate,
  ]);


  // --------------------------------------------------
  // SET DEFAULT DATE RANGE FROM AVAILABLE DATA
  // --------------------------------------------------

  useEffect(() => {
    if (
      !historicalData?.daily ||
      historicalData.daily.length === 0
    ) {
      return;
    }

    const availableDates =
      historicalData.daily
        .map((item) =>
          normalizeDate(
            item.Date ??
            item.date
          )
        )
        .filter(Boolean)
        .sort();

    if (
      availableDates.length === 0
    ) {
      return;
    }

    /*
     * Only set dates automatically
     * when the user has not selected them.
     */

    if (!fromDate) {
      setFromDate(
        availableDates[0]
      );
    }

    if (!toDate) {
      setToDate(
        availableDates[
          availableDates.length - 1
        ]
      );
    }

  }, [
    historicalData,
    fromDate,
    toDate,
  ]);


  // --------------------------------------------------
  // MONTHLY DATA
  // --------------------------------------------------

  const monthlyData = useMemo(() => {
    if (
      !historicalData?.monthly
    ) {
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
      .map((item) => {
        const monthNumber =
          Number(
            item.Month ??
            item.month
          );

        const demand =
          Number(
            item.Monthly_Demand_MW ??
            item.monthly_demand_mw ??
            item.Demand_MW ??
            item.demand ??
            0
          );

        return {
          month:
            monthNames[
              monthNumber - 1
            ] ??
            item.Month ??
            item.month,

          demand,

          monthNumber,
        };
      })
      .filter(
        (item) =>
          item.demand > 0
      )
      .sort(
        (a, b) =>
          a.monthNumber -
          b.monthNumber
      );

  }, [
    historicalData,
  ]);


  // --------------------------------------------------
  // SEASONAL DATA
  // --------------------------------------------------

  const seasonalData = useMemo(() => {
    if (
      !historicalData?.seasonal
    ) {
      return [];
    }

    return historicalData.seasonal
      .map((item) => ({
        season:
          item.Season ??
          item.season,

        demand:
          Number(
            item.Seasonal_Demand_MW ??
            item.seasonal_demand_mw ??
            item.Demand_MW ??
            item.demand ??
            0
          ),
      }))
      .filter(
        (item) =>
          item.demand > 0
      );

  }, [
    historicalData,
  ]);


  // --------------------------------------------------
  // CALCULATE STATISTICS
  // --------------------------------------------------

  const statistics = useMemo(() => {

    if (
      dailyData.length === 0
    ) {
      return {
        highest: null,
        lowest: null,
        average: null,
        highestDate: '',
        lowestDate: '',
      };
    }


    // -----------------------------------------------
    // Get demand values
    // -----------------------------------------------

    const demands =
      dailyData.map(
        (item) =>
          Number(item.demand)
      );


    // -----------------------------------------------
    // Highest
    // -----------------------------------------------

    const highest =
      Math.max(...demands);


    // -----------------------------------------------
    // Lowest
    // -----------------------------------------------

    const lowest =
      Math.min(...demands);


    // -----------------------------------------------
    // Average
    // -----------------------------------------------

    const average =
      demands.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / demands.length;


    // -----------------------------------------------
    // Highest demand date
    // -----------------------------------------------

    const highestItem =
      dailyData.find(
        (item) =>
          item.demand === highest
      );


    // -----------------------------------------------
    // Lowest demand date
    // -----------------------------------------------

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

  }, [
    dailyData,
  ]);


  // --------------------------------------------------
  // FORMAT MW
  // --------------------------------------------------

  const formatMW = (value) => {

    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
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
  // FORMAT DATE FOR DISPLAY
  // --------------------------------------------------

  const formatDate = (value) => {

    if (!value) {
      return 'No data';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      'en-IN'
    );
  };


  // --------------------------------------------------
  // LOADING
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
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography
          color="error"
        >
          {error}
        </Typography>
      </Box>
    );
  }


  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

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

          <HistoryIcon
            color="primary"
          />

          <Typography
            variant="h4"
            fontWeight={700}
          >
            Historical Demand
          </Typography>

        </Box>

        <Typography
          color="text.secondary"
        >
          Analyze historical electricity
          demand trends across Indian
          states.
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

            {/* STATE */}

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

                  /*
                   * Clear date filters when
                   * state changes so that the
                   * new state's available
                   * dates can be used.
                   */

                  setFromDate('');
                  setToDate('');

                }}
              >

                {states.map(
                  (state) => (
                    <MenuItem
                      key={state}
                      value={state}
                    >
                      {state}
                    </MenuItem>
                  )
                )}

              </Select>

            </FormControl>


            {/* FROM DATE */}

            <TextField
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(event) =>
                setFromDate(
                  event.target.value
                )
              }
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />


            {/* TO DATE */}

            <TextField
              label="To Date"
              type="date"
              value={toDate}
              onChange={(event) =>
                setToDate(
                  event.target.value
                )
              }
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
      {/* SELECTED STATE */}
      {/* ========================================== */}

      <Typography
        sx={{ mb: 2 }}
      >
        Showing analytics for{' '}
        <strong>
          {selectedState}
        </strong>
      </Typography>


      {/* ========================================== */}
      {/* KPI CARDS */}
      {/* ========================================== */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >

        {/* ====================================== */}
        {/* HIGHEST */}
        {/* ====================================== */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >

          <Card>

            <CardContent>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >

                <TrendingUpIcon
                  color="primary"
                />

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

                {statistics.highestDate
                  ? formatDate(
                      statistics.highestDate
                    )
                  : 'No data'}

              </Typography>

            </CardContent>

          </Card>

        </Grid>


        {/* ====================================== */}
        {/* LOWEST */}
        {/* ====================================== */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >

          <Card>

            <CardContent>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >

                <TrendingDownIcon
                  color="primary"
                />

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

                {statistics.lowestDate
                  ? formatDate(
                      statistics.lowestDate
                    )
                  : 'No data'}

              </Typography>

            </CardContent>

          </Card>

        </Grid>


        {/* ====================================== */}
        {/* AVERAGE */}
        {/* ====================================== */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >

          <Card>

            <CardContent>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >

                <EqualizerIcon
                  color="primary"
                />

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

                Based on selected
                date range

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
            Daily electricity demand
            for{' '}
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

              <Typography
                color="text.secondary"
              >
                No demand data available
                for the selected date
                range.
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
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    label={{
                      value: 'MW',
                      angle: -90,
                      position:
                        'insideLeft',
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

        {/* ====================================== */}
        {/* MONTHLY */}
        {/* ====================================== */}

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
              Monthly electricity
              demand
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


        {/* ====================================== */}
        {/* SEASONAL */}
        {/* ====================================== */}

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
              Electricity demand by
              season
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