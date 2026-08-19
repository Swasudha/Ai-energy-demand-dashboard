import { Box, Card, Skeleton } from "@mui/material";

function LoadingSkeleton({ rows = 3 }) {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 4,
      }}
    >
      <Skeleton
        variant="text"
        width="35%"
        height={35}
      />

      <Skeleton
        variant="text"
        width="60%"
        height={25}
      />

      <Box sx={{ mt: 2 }}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={45}
            sx={{
              mb: 1,
              borderRadius: 2,
            }}
          />
        ))}
      </Box>
    </Card>
  );
}

export default LoadingSkeleton;