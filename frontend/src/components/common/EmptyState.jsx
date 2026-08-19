import { Box, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function EmptyState({
  title = "No data available",
  message = "There is no data available for the selected filters.",
}) {
  return (
    <Box
      sx={{
        py: 8,
        textAlign: "center",
      }}
    >
      <InfoOutlinedIcon
        sx={{
          fontSize: 48,
          color: "text.secondary",
          mb: 2,
        }}
      />

      <Typography
        variant="h6"
        fontWeight={700}
        gutterBottom
      >
        {title}
      </Typography>

      <Typography color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export default EmptyState;