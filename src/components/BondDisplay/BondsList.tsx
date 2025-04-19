"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
  Tooltip,
  CircularProgress,
  Collapse,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IBondCategory } from "../../../lib/models/Bond";
import BondFormWithAutocomplete from "./BondFormWithAutocomplete";
import { deleteBond } from "../../app/actions/bond";
import { formatBonds } from "../../utils/bondUtils";

interface BondRecord {
  _id: string;
  customer: string;
  categories: IBondCategory[];
}

interface BondsListProps {
  bonds: BondRecord[];
  onBondUpdated: () => void;
}

const BondsList: React.FC<BondsListProps> = ({ bonds, onBondUpdated }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBond, setSelectedBond] = useState<BondRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bondToEdit, setBondToEdit] = useState<{
    id: string;
    customer: string;
    categories: IBondCategory[];
  } | null>(null);
  const [copyNotification, setCopyNotification] = useState({
    open: false,
    message: "",
  });

  const handleToggleExpand = (bondId: string) => {
    setExpandedId(expandedId === bondId ? null : bondId);
  };

  const handleDeleteClick = (bond: BondRecord) => {
    setSelectedBond(bond);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (bond: BondRecord) => {
    setBondToEdit({
      id: bond._id,
      customer: bond.customer,
      categories: bond.categories,
    });
    setEditDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedBond(null);
    setError("");
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setBondToEdit(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBond) return;

    setDeleting(true);
    setError("");

    try {
      const result = await deleteBond(selectedBond._id);
      if (result.success) {
        handleCloseDeleteDialog();
        onBondUpdated();
      } else {
        setError(result.error || "Failed to delete bond");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyBonds = (bonds: number[]) => {
    const bondString = bonds.join(", ");

    navigator.clipboard
      .writeText(bondString)
      .then(() => {
        setCopyNotification({
          open: true,
          message: `${bonds.length} bond numbers copied to clipboard`,
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setCopyNotification({
          open: true,
          message: "Failed to copy to clipboard",
        });
      });
  };

  const handleCloseCopyNotification = () => {
    setCopyNotification({
      ...copyNotification,
      open: false,
    });
  };

  // Calculate total bonds for a record
  const getTotalBonds = (bond: BondRecord) => {
    return bond.categories.reduce((total, category) => total + category.bonds.length, 0);
  };

  if (bonds.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", bgcolor: "background.paper" }}>
        <Typography variant="body1" color="text.secondary">
          No bonds found
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={500} gutterBottom>
        Manage Bonds
      </Typography>

      <Paper sx={{ bgcolor: "background.paper" }}>
        <List disablePadding>
          {bonds.map((bond, index) => (
            <React.Fragment key={bond._id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                alignItems="flex-start"
                sx={{
                  py: 2,
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton size="small" onClick={() => handleToggleExpand(bond._id)} sx={{ mr: 1 }}>
                      {expandedId === bond._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>

                    <Box>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {bond.customer}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bond.categories.length} categories, {getTotalBonds(bond)} bonds
                      </Typography>
                    </Box>
                    <Box sx={{ ml: "auto", pr: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Tooltip title="Edit Bond Data">
                          <IconButton
                            edge="end"
                            aria-label="edit bond"
                            color="primary"
                            size="medium"
                            sx={{
                              mr: 1,
                              boxShadow: 1,
                              bgcolor: "background.paper",
                              "&:hover": { bgcolor: "primary.light", color: "common.white" },
                            }}
                            onClick={() => handleEditClick(bond)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Bond">
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteClick(bond)}
                            color="error"
                            size="medium"
                            sx={{
                              boxShadow: 1,
                              bgcolor: "background.paper",
                              "&:hover": { bgcolor: "error.light", color: "common.white" },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>

                  <Collapse in={expandedId === bond._id} timeout="auto" unmountOnExit>
                    <Box sx={{ ml: 7, mt: 2 }}>
                      {bond.categories.map((category, catIndex) => (
                        <Box key={catIndex} sx={{ mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="subtitle2" fontWeight={500}>
                              {category.name} ({category.bonds.length})
                            </Typography>
                            <Tooltip title="Copy all bond numbers">
                              <IconButton
                                size="small"
                                onClick={() => handleCopyBonds(category.bonds)}
                                sx={{ ml: 1, p: 0.5 }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Paper variant="outlined" sx={{ p: 1, mt: 1, bgcolor: "background.default" }}>
                            <Typography sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                              {formatBonds(category.bonds)}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete bond data for <strong>{selectedBond?.customer}</strong>? This action cannot
            be undone.
          </DialogContentText>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      {editDialogOpen && bondToEdit && (
        <BondFormWithAutocomplete
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          onComplete={() => {
            handleCloseEditDialog();
            onBondUpdated();
          }}
          editBond={bondToEdit}
        />
      )}

      {/* Add notification for copy */}
      <Snackbar
        open={copyNotification.open}
        autoHideDuration={3000}
        onClose={handleCloseCopyNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseCopyNotification} severity="success" variant="filled">
          {copyNotification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BondsList;
