"use client";

import { Box, Button, Typography } from "@mui/material";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; shortMessage?: string; details?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexFlow: "column",
        height: "50vh",
        gap: 1,
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        Something went wrong!
      </Typography>
      <Typography>{error.shortMessage || error.details || error.message || JSON.stringify(error)}</Typography>
      <Button
        variant="contained"
        onClick={
          // Attempt to recover by trying to re-render the invoices route
          () => reset()
        }
      >
        Try again
      </Button>
    </Box>
  );
}
