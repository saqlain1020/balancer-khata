"use client";
import { Save } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Grid, MenuItem, TextField, Typography } from "@mui/material";
import { useFormState, useFormStatus } from "react-dom";
import { addExpense } from "src/app/actions/expense";

export default function CustomerPage({ params }: { params: { customerId: string } }) {
  const [state, formAction] = useFormState(addExpense, null);
  return (
    <Box component={"form"} action={formAction}>
      <Typography variant="h5" fontWeight={600}>
        Add Expense
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Name */}
        <Grid item xs={12} sm={6}>
          <TextField name="reason" fullWidth label="Reason" required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="amount" fullWidth label="Amount" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="date"
            fullWidth
            label="Date"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="type" defaultValue="sent" fullWidth label="Type" select>
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="received">Received</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ display: "none" }}>
          <TextField name="customer" fullWidth label="Customer" value={params.customerId} />
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
      Save Expense
    </LoadingButton>
  );
}
