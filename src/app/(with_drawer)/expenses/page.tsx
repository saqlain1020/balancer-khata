import { Box } from "@mui/material";
import React from "react";
import AddExpenseModal from "./_components/AddExpenseModal/AddExpenseModal";
import ExpensesTable from "./_components/ExpensesTable/ExpensesTable";
import { getExpenses } from "src/app/actions/expense";

export default async function Page() {
  const data = await getExpenses();
  return (
    <Box>
      <AddExpenseModal />
      <ExpensesTable data={data} />
    </Box>
  );
}
