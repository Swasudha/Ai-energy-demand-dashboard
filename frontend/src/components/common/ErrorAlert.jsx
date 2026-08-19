import { Alert, AlertTitle } from "@mui/material";

function ErrorAlert({
  message = "Unable to load data. Please try again.",
}) {
  return (
    <Alert
      severity="error"
      sx={{
        borderRadius: 3,
        mb: 3,
      }}
    >
      <AlertTitle>Something went wrong</AlertTitle>

      {message}
    </Alert>
  );
}

export default ErrorAlert;