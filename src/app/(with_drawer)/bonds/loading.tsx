import { Box, Skeleton } from "@mui/material";

export default function Loading() {
  return (
    <Box sx={{ height: "50dvh" }}>
      <Skeleton sx={{ height: "100%", transform: "none" }} />
    </Box>
  );
}
