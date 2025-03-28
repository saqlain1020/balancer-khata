"use client";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { DataGrid, GridToolbar, GridColDef } from "@mui/x-data-grid";
import moment from "moment";
import { Delete } from "@mui/icons-material";
import { useFormState } from "react-dom";
import { IExpense } from "../../../lib/models/Expense";
import { deleteExpense } from "src/app/actions/expense";

const columns: GridColDef<Omit<IExpense, "customer">>[] = [
  {
    field: "amount",
    sortable: true,
    minWidth: 100,
    headerName: "Amount",
    valueFormatter: (v?: number) => (v ? Number(v).toLocaleString() : "-"),
    flex: 1,
  },
  {
    field: "reason",
    sortable: true,
    minWidth: 100,
    headerName: "Reason",
    flex: 1,
  },
  {
    field: "date",
    sortable: true,
    minWidth: 100,
    headerName: "Date",
    valueFormatter: (v: string) => (v ? moment(v).fromNow() : "-"),
    flex: 1,
    renderCell(params) {
      return (
        <Box className="center" sx={{ height: "100%" }}>
          <Tooltip placement="top" title={moment(params.value).format("DD-MMM-YYYY")}>
            <Typography sx={{ fontSize: 14 }}>{params.formattedValue}</Typography>
          </Tooltip>
        </Box>
      );
    },
  },
  {
    field: "type",
    sortable: true,
    cellClassName: (params) => (params.value === "received" ? "red" : "green"),
    minWidth: 100,
    headerName: "Type",
    valueFormatter: (v?: string) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : "-"),
    valueGetter: (v?: string) => (v ? v : ""),
    flex: 1,
  },
];

const ExpenseTable: React.FC<{ data: IExpense[] }> = ({ data }) => {
  const [_, formAction] = useFormState(deleteExpense, null);

  const rows = useMemo(() => {
    return data.map((item) => {
      return {
        ...item,
      };
    });
  }, [data]);

  return (
    <Box sx={{ minHeight: 300, mt: 2 }}>
      <DataGrid
        sx={{ minHeight: 300 }}
        disableColumnFilter
        // disableColumnSelector
        disableDensitySelector
        // checkboxSelection
        // loading
        getRowId={(row) => row._id}
        // onRowClick={(params) => {
        //   router.push(`products/${params.row._id}`);
        // }}
        // @ts-ignore
        rows={rows}
        columns={[
          ...columns,
          {
            headerName: "Actions",
            field: "",
            width: 150,
            align: "center",
            renderCell(params) {
              return (
                <Box>
                  <IconButton size="small" onClick={() => formAction(params.row._id)}>
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
    </Box>
  );
};

export default ExpenseTable;
