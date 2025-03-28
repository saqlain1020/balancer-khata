import { Box, Card, Divider, Grid, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { makeStyles } from "src/hooks/useSxStyles";
import { getCustomers } from "../actions/customer";
import Link from "next/link";

const sxStyles = makeStyles((theme) => ({
  root: {
    color: "red",
  },
}));

export default async function Home() {
  const customers = await getCustomers();

  const totalToGet = customers.reduce((acc, item) => {
    if (item.balance > 0) acc += item.balance;
    return acc;
  }, 0);

  const totalToPay = customers.reduce((acc, item) => {
    if (item.balance < 0) acc += item.balance;
    return acc;
  }, 0);

  return (
    <Box component={"main"}>
      <Typography variant="h4" fontWeight={600}>
        Customers
      </Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2 }} elevation={10}>
            <Typography textAlign={"center"} variant="body2" color="grey">
              To Get
            </Typography>
            <Typography textAlign={"center"} color={"green"} fontWeight={600} variant="h5">
              {totalToGet.toLocaleString()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2 }} elevation={10}>
            <Typography textAlign={"center"} variant="body2" color="grey">
              To Pay
            </Typography>
            <Typography textAlign={"center"} color={"red"} fontWeight={600} variant="h5">
              {totalToPay.toLocaleString()}
            </Typography>
          </Card>
        </Grid>
      </Grid>
      <Divider sx={{ mt: 2, mb: 2 }} />
      {customers.map((item) => (
        <List dense key={item._id}>
          <ListItemButton component={Link} href={`/customers/${item._id}`}>
            <ListItemText>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" fontWeight={600}>
                  {item.name}
                </Typography>
                <Typography color={item.balance < 0 ? "red" : "green"} variant="body2">
                  {item.balance.toLocaleString()}
                </Typography>
              </Box>
            </ListItemText>
          </ListItemButton>
        </List>
      ))}
    </Box>
  );
}
