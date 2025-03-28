import { Box, Button, Divider, Typography } from "@mui/material";
import Link from "next/link";
import { getCustomer } from "src/app/actions/customer";
import { getExpenses } from "src/app/actions/expense";
import ExpenseTable from "src/components/ExpenseTable/ExpenseTable";

export default async function CustomerPage({ params }: { params: { customerId: string } }) {
  const customer = await getCustomer(params.customerId);
  if (!customer) {
    return <div>Customer not found</div>;
  }
  const expenses = await getExpenses(params.customerId);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {customer?.name}
          </Typography>
          <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            Balance:{" "}
            <Typography component={"span"} sx={{ color: customer.balance < 0 ? "red" : "green" }}>
              {customer?.balance.toLocaleString()}
            </Typography>
          </Typography>
        </Box>
        <Button variant="outlined" component={Link} href={`/customers/${customer?._id}/add-expense`}>
          Add Expense
        </Button>
      </Box>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Typography variant="h6" fontWeight={600}>
        Expenses
      </Typography>
      <ExpenseTable data={expenses} />
    </Box>
  );
}
