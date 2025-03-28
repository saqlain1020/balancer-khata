"use client";
import { Delete } from "@mui/icons-material";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import moment from "moment";
import React from "react";
import { IExpense } from "../../../../../../lib/models/Expense_old";
import { deleteExpense } from "src/app/actions/expense";

const data = [
  {
    _id: "1",
    reason: "Buy Potato",
    amount: 100,
    date: moment(),
  },
  {
    _id: "2",
    reason: "Buy Yougurt",
    amount: 250,
    date: moment("2022-01-01"),
  },
];

const ExpensesTable: React.FC<{ data: IExpense[] }> = ({ data }) => {
  return (
    <DataGrid
      sx={{ minHeight: 300, mt: 2 }}
      disableColumnFilter
      disableDensitySelector
      getRowId={(row) => row._id}
      // @ts-ignore
      rows={data}
      columns={[
        {
          headerName: "Reason",
          field: "reason",
          flex: 1,
        },
        {
          headerName: "Date",
          field: "date",
          flex: 1,
          valueGetter(_, row) {
            return new Date(row.date).getTime();
          },
          renderCell(params) {
            return (
              <Box className="center" sx={{ height: "100%", justifyContent: "flex-start" }}>
                <Tooltip placement="top" title={moment(params.value).format("DD-MMM-YYYY hh:mm")}>
                  <Typography sx={{ fontSize: 14 }}>{moment(params.value).fromNow()}</Typography>
                </Tooltip>
              </Box>
            );
          },
        },
        {
          headerName: "Amount",
          field: "amount",
          flex: 1,
          renderCell(params) {
            return (
              <Box className="center" sx={{ height: "100%", justifyContent: "flex-start" }}>
                <Tooltip placement="top" title={params.value < 0 ? "Income" : "Expense"}>
                  <Typography sx={{ fontSize: 14, color: params.value < 0 ? "green" : "red" }}>
                    {Math.abs(params.value)}
                  </Typography>
                </Tooltip>
              </Box>
            );
          },
        },
        {
          headerName: "Actions",
          field: "",
          width: 100,
          align: "center",
          renderCell(params) {
            return (
              <Box>
                <IconButton size="small" onClick={() => deleteExpense(params.row._id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            );
          },
        },
      ]}
      slots={{ toolbar: GridToolbar }}
      slotProps={{
        toolbar: {
          showQuickFilter: true,
        },
      }}
    />
  );
};

export default ExpensesTable;
