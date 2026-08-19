import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";

import { getAnomalies } from "../../services/api";

function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnomalies();
  }, []);

  const loadAnomalies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAnomalies();

      setAnomalies(response.data);
    } catch (err) {
      console.error("Failed to load anomalies:", err);

      setError(
        "Unable to load anomaly data. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "High") {
      return "error";
    }

    if (status === "Low") {
      return "warning";
    }

    return "success";
  };

  const getStatusLabel = (status) => {
    if (status === "High") {
      return "🔴 High";
    }

    if (status === "Low") {
      return "🟡 Low";
    }

    return "🟢 Normal";
  };

  return (
    <Box>
      {/* Page Header */}
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
      >
        Anomaly Detection
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Detect unusual electricity demand patterns using statistical anomaly
        detection.
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

      {/* Loading */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          <Table>
            {/* Table Header */}
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Date</strong>
                </TableCell>

                <TableCell>
                  <strong>State</strong>
                </TableCell>

                <TableCell align="right">
                  <strong>Demand (MW)</strong>
                </TableCell>

                <TableCell align="right">
                  <strong>Expected Demand (MW)</strong>
                </TableCell>

                <TableCell align="right">
                  <strong>Deviation (MW)</strong>
                </TableCell>

                <TableCell align="right">
                  <strong>Z-Score</strong>
                </TableCell>

                <TableCell>
                  <strong>Status</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body */}
            <TableBody>
              {anomalies.map((item, index) => (
                <TableRow
                  key={`${item.state}-${item.date}-${index}`}
                  hover
                >
                  {/* Date */}
                  <TableCell>
                    {item.date}
                  </TableCell>

                  {/* State */}
                  <TableCell>
                    {item.state}
                  </TableCell>

                  {/* Demand */}
                  <TableCell align="right">
                    {Number(item.demand).toLocaleString()} MW
                  </TableCell>

                  {/* Expected Demand */}
                  <TableCell align="right">
                    {Number(item.expectedDemand).toLocaleString()} MW
                  </TableCell>

                  {/* Deviation */}
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 600,
                      color:
                        item.deviation > 0
                          ? "error.main"
                          : item.deviation < 0
                          ? "warning.main"
                          : "text.primary",
                    }}
                  >
                    {item.deviation > 0 ? "+" : ""}
                    {Number(item.deviation).toLocaleString()} MW
                  </TableCell>

                  {/* Z-Score */}
                  <TableCell align="right">
                    {Number(item.zScore).toFixed(2)}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={getStatusLabel(item.status)}
                      color={getStatusColor(item.status)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {/* No Data */}
              {anomalies.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 5 }}
                  >
                    <Typography color="text.secondary">
                      No anomaly data available.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default Anomalies;