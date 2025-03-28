"use client";
import { Save } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Grid, TextField, Typography } from "@mui/material";
import { useFormState, useFormStatus } from "react-dom";
import { addCustomer } from "src/app/actions/customer";

export default function AddCustomer() {
  const [state, formAction] = useFormState(addCustomer, null);

  return (
    <Box component={"form"} action={formAction}>
      <Typography variant="h5" fontWeight={600}>
        Add Customer
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Name */}
        <Grid item xs={12} sm={6}>
          <TextField name="name" fullWidth label="Name" required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="phone" fullWidth label="Phone" />
        </Grid>

        <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <SubmitButton />
        </Grid>
      </Grid>
    </Box>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <LoadingButton loading={pending} type="submit" loadingPosition="start" startIcon={<Save />} variant="contained">
      Save Customer
    </LoadingButton>
  );
}
