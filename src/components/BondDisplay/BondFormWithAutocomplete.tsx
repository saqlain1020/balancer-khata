"use client";

import React, { useState, useEffect } from "react";
import { Person, BondCategory } from "../../types/bonds";
import { IBondCategory } from "../../../lib/models/Bond";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  FormHelperText,
  Autocomplete,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CategoryIcon from "@mui/icons-material/Category";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { addBond, updateBond, getCustomerNames, getCategoryNames } from "../../app/actions/bond";

interface BondFormProps {
  onComplete: () => void;
  editBond?: {
    id: string;
    customer: string;
    categories: IBondCategory[];
  } | null;
  id?: string;
  open?: boolean;
  onClose?: () => void;
}

const BondFormWithAutocomplete: React.FC<BondFormProps> = ({
  onComplete,
  editBond = null,
  id,
  open: controlledOpen,
  onClose: controlledClose,
}) => {
  // Use internal state if not controlled externally
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Determine if dialog is open based on props or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [bondNumbers, setBondNumbers] = useState("");
  const [categories, setCategories] = useState<IBondCategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  // Bond range inputs
  const [rangeStart, setRangeStart] = useState<string>("");
  const [rangeEnd, setRangeEnd] = useState<string>("");

  // State to track range inputs per category
  const [categoryRanges, setCategoryRanges] = useState<Record<number, { start: string; end: string }>>({});

  // Autocomplete options
  const [customerOptions, setCustomerOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load edit data if provided
  useEffect(() => {
    if (editBond) {
      setCustomerName(editBond.customer);
      setCategories(editBond.categories);
    }
  }, [editBond]);

  // Load autocomplete options
  const loadOptions = async () => {
    setLoadingCustomers(true);
    setLoadingCategories(true);

    try {
      const customerNames = await getCustomerNames();
      setCustomerOptions(customerNames);

      const categoryNames = await getCategoryNames();
      setCategoryOptions(categoryNames);
    } catch (error) {
      console.error("Failed to load autocomplete options:", error);
    } finally {
      setLoadingCustomers(false);
      setLoadingCategories(false);
    }
  };

  const handleOpen = () => {
    if (controlledOpen === undefined) {
      setInternalOpen(true);
    }
    loadOptions();
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing during submission

    if (controlledClose) {
      controlledClose();
    } else {
      setInternalOpen(false);
    }
    resetForm();
  };

  const resetForm = () => {
    if (!editBond) {
      setCustomerName("");
      setCategories([]);
    } else {
      setCustomerName(editBond.customer);
      setCategories(editBond.categories);
    }
    setCategoryName("");
    setBondNumbers("");
    setRangeStart("");
    setRangeEnd("");
    setErrors({});
    setExpandedCategory(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (categoryName.trim() && bondNumbers.trim()) {
      // Check if bond numbers are valid
      const isValid = /^(\d+)(\s*,\s*\d+)*$/.test(bondNumbers.trim());
      if (!isValid) {
        newErrors.bondNumbers = "Enter comma-separated numbers";
      }
    }

    if (categories.length === 0) {
      newErrors.general = "Add at least one category with bonds";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Add any pending category first
    if (categoryName.trim() && (bondNumbers.trim() || (rangeStart && rangeEnd))) {
      handleAddCategory();
      // Wait for state update
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = {
        customer: customerName,
        categories: categories,
      };

      let result;
      if (editBond) {
        result = await updateBond(editBond.id, data);
      } else {
        result = await addBond(data);
      }

      if (result.success) {
        setNotification({
          open: true,
          message: editBond ? "Bond updated successfully" : "Bond added successfully",
          severity: "success",
        });
        handleClose();
        onComplete();
      } else {
        setNotification({
          open: true,
          message: result.error || "An error occurred",
          severity: "error",
        });
      }
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.message || "An error occurred",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateAndGetRangeNumbers = (): number[] | null => {
    if (!rangeStart.trim() || !rangeEnd.trim()) {
      return null;
    }

    const start = parseInt(rangeStart.trim(), 10);
    const end = parseInt(rangeEnd.trim(), 10);

    if (isNaN(start) || isNaN(end)) {
      setErrors((prev) => ({ ...prev, bondRange: "Enter valid numbers" }));
      return null;
    }

    if (start > end) {
      setErrors((prev) => ({ ...prev, bondRange: "Start must be less than or equal to end" }));
      return null;
    }

    if (end - start > 1000) {
      setErrors((prev) => ({ ...prev, bondRange: "Range too large (max 1000 bonds)" }));
      return null;
    }

    const numbers: number[] = [];
    for (let i = start; i <= end; i++) {
      numbers.push(i);
    }

    return numbers;
  };

  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      setErrors((prev) => ({ ...prev, categoryName: "Category name is required" }));
      return;
    }

    let numbers: number[] = [];

    // Process comma-separated numbers if provided
    if (bondNumbers.trim()) {
      // Validate bond numbers format
      const isValid = /^(\d+)(\s*,\s*\d+)*$/.test(bondNumbers.trim());
      if (!isValid) {
        setErrors((prev) => ({ ...prev, bondNumbers: "Enter comma-separated numbers" }));
        return;
      }

      // Parse bond numbers
      numbers = bondNumbers
        .split(",")
        .map((num) => parseInt(num.trim(), 10))
        .filter((num) => !isNaN(num));
    }

    // Process range if provided
    const rangeNumbers = validateAndGetRangeNumbers();
    if (rangeNumbers) {
      numbers = [...numbers, ...rangeNumbers];
    }

    // Make sure we have at least one number
    if (numbers.length === 0) {
      setErrors((prev) => ({
        ...prev,
        bondNumbers: !bondNumbers.trim() ? "Enter at least one bond number or range" : "",
        bondRange: !rangeStart.trim() && !rangeEnd.trim() ? "Enter a valid range or individual numbers" : "",
      }));
      return;
    }

    // Remove duplicates and sort
    const uniqueNumbersSet = new Set(numbers);
    numbers = Array.from(uniqueNumbersSet).sort((a, b) => a - b);

    // Add the category
    setCategories((prev) => [
      ...prev,
      {
        name: categoryName,
        bonds: numbers,
      },
    ]);

    // Add to category options if it's a new one
    if (!categoryOptions.includes(categoryName)) {
      setCategoryOptions((prev) => [...prev, categoryName]);
    }

    // Clear inputs and errors
    setCategoryName("");
    setBondNumbers("");
    setRangeStart("");
    setRangeEnd("");
    setErrors({});
  };

  const handleDeleteCategory = (index: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategoryNameChange = (index: number, newName: string) => {
    setCategories((prev) => prev.map((cat, i) => (i === index ? { ...cat, name: newName } : cat)));
  };

  const handleAddBondToCategory = (index: number, newBond: number) => {
    if (isNaN(newBond)) return;

    setCategories((prev) =>
      prev.map((cat, i) => (i === index ? { ...cat, bonds: [...cat.bonds, newBond].sort((a, b) => a - b) } : cat))
    );
  };

  const handleAddRangeToCategory = (index: number, start: number, end: number) => {
    if (isNaN(start) || isNaN(end) || start > end) return;
    if (end - start > 1000) {
      setNotification({
        open: true,
        message: "Range too large (max 1000 bonds)",
        severity: "error",
      });
      return;
    }

    const newBonds: number[] = [];
    for (let i = start; i <= end; i++) {
      newBonds.push(i);
    }

    setCategories((prev) =>
      prev.map((cat, i) => {
        if (i !== index) return cat;
        // Combine existing bonds with new ones, remove duplicates, and sort
        const combinedBonds = [...cat.bonds, ...newBonds];
        const uniqueBondsSet = new Set(combinedBonds);
        const allBonds = Array.from(uniqueBondsSet).sort((a, b) => a - b);
        return { ...cat, bonds: allBonds };
      })
    );

    // Clear the range inputs for this category
    setCategoryRanges((prev) => ({
      ...prev,
      [index]: { start: "", end: "" },
    }));
  };

  const handleRemoveBondFromCategory = (categoryIndex: number, bondValue: number) => {
    setCategories((prev) =>
      prev.map((cat, i) => (i === categoryIndex ? { ...cat, bonds: cat.bonds.filter((b) => b !== bondValue) } : cat))
    );
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      {controlledOpen === undefined && (
        <Button
          variant="contained"
          startIcon={editBond ? <EditIcon /> : <AddIcon />}
          onClick={handleOpen}
          sx={{ mb: 3 }}
          id={id}
        >
          {editBond ? "Edit Bond Data" : "Add Bond Data"}
        </Button>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editBond ? "Edit Bond Data" : "Add New Bond Data"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Customer name with autocomplete */}
            <Autocomplete
              value={customerName}
              onChange={(_, newValue) => {
                setCustomerName(newValue || "");
                if (errors.customerName) {
                  setErrors((prev) => ({ ...prev, customerName: "" }));
                }
              }}
              inputValue={customerName}
              onInputChange={(_, newInputValue) => {
                setCustomerName(newInputValue);
                if (errors.customerName) {
                  setErrors((prev) => ({ ...prev, customerName: "" }));
                }
              }}
              options={customerOptions}
              freeSolo
              loading={loadingCustomers}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer Name"
                  required
                  error={!!errors.customerName}
                  helperText={errors.customerName}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingCustomers ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {/* Categories section */}
            <Box>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Categories
              </Typography>

              {categories.length > 0 ? (
                <Box sx={{ mb: 3 }}>
                  {categories.map((category, index) => (
                    <Accordion
                      key={index}
                      expanded={expandedCategory === index}
                      onChange={() => setExpandedCategory(expandedCategory === index ? null : index)}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CategoryIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography>
                              {category.name} ({category.bonds.length})
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(index);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Autocomplete
                            value={category.name}
                            onChange={(_, newValue) => {
                              handleCategoryNameChange(index, newValue || "");
                            }}
                            inputValue={category.name}
                            onInputChange={(_, newInputValue) => {
                              handleCategoryNameChange(index, newInputValue);
                            }}
                            options={categoryOptions}
                            freeSolo
                            loading={loadingCategories}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Category Name"
                                size="small"
                                sx={{ mb: 2 }}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {loadingCategories ? <CircularProgress color="inherit" size={16} /> : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                          />

                          <Typography variant="subtitle2" gutterBottom>
                            Bonds
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                            {category.bonds.map((bond) => (
                              <Chip
                                key={bond}
                                label={bond}
                                onDelete={() => handleRemoveBondFromCategory(index, bond)}
                                sx={{ fontWeight: 500 }}
                              />
                            ))}
                          </Box>

                          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <TextField
                              label="Add Bond"
                              size="small"
                              type="number"
                              InputProps={{ inputProps: { min: 1 } }}
                              placeholder="Enter a number"
                              sx={{ flexGrow: 1 }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const input = e.target as HTMLInputElement;
                                  const value = parseInt(input.value);
                                  if (!isNaN(value)) {
                                    handleAddBondToCategory(index, value);
                                    input.value = "";
                                  }
                                }
                              }}
                            />
                            <Button
                              variant="outlined"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling?.querySelector("input");
                                if (input) {
                                  const value = parseInt(input.value);
                                  if (!isNaN(value)) {
                                    handleAddBondToCategory(index, value);
                                    input.value = "";
                                  }
                                }
                              }}
                            >
                              Add
                            </Button>
                          </Box>

                          {/* Add range to existing category */}
                          <Typography variant="subtitle2" gutterBottom>
                            Add Range
                          </Typography>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={5}>
                              <TextField
                                label="From"
                                size="small"
                                type="number"
                                value={categoryRanges[index]?.start || ""}
                                onChange={(e) => {
                                  setCategoryRanges((prev) => ({
                                    ...prev,
                                    [index]: {
                                      ...(prev[index] || { end: "" }),
                                      start: e.target.value,
                                    },
                                  }));
                                }}
                                InputProps={{ inputProps: { min: 1 } }}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={5}>
                              <TextField
                                label="To"
                                size="small"
                                type="number"
                                value={categoryRanges[index]?.end || ""}
                                onChange={(e) => {
                                  setCategoryRanges((prev) => ({
                                    ...prev,
                                    [index]: {
                                      ...(prev[index] || { start: "" }),
                                      end: e.target.value,
                                    },
                                  }));
                                }}
                                InputProps={{ inputProps: { min: 1 } }}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  const start = parseInt(categoryRanges[index]?.start || "");
                                  const end = parseInt(categoryRanges[index]?.end || "");

                                  if (!isNaN(start) && !isNaN(end) && start <= end) {
                                    handleAddRangeToCategory(index, start, end);
                                  } else {
                                    setNotification({
                                      open: true,
                                      message: "Please enter a valid range",
                                      severity: "error",
                                    });
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No categories added yet. Add a category below.
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Add new category */}
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Add New Category
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Autocomplete
                  value={categoryName}
                  onChange={(_, newValue) => {
                    setCategoryName(newValue || "");
                    if (errors.categoryName) {
                      setErrors((prev) => ({ ...prev, categoryName: "" }));
                    }
                  }}
                  inputValue={categoryName}
                  onInputChange={(_, newInputValue) => {
                    setCategoryName(newInputValue);
                    if (errors.categoryName) {
                      setErrors((prev) => ({ ...prev, categoryName: "" }));
                    }
                  }}
                  options={categoryOptions}
                  freeSolo
                  loading={loadingCategories}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category Name"
                      error={!!errors.categoryName}
                      helperText={errors.categoryName}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingCategories ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />

                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                    Individual Numbers
                    <Tooltip title="Enter individual bond numbers separated by commas">
                      <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <TextField
                    label="Bond Numbers"
                    fullWidth
                    value={bondNumbers}
                    onChange={(e) => {
                      setBondNumbers(e.target.value);
                      if (errors.bondNumbers) {
                        setErrors((prev) => ({ ...prev, bondNumbers: "" }));
                      }
                    }}
                    placeholder="Enter comma-separated numbers (e.g., 101, 102, 103)"
                    error={!!errors.bondNumbers}
                    helperText={errors.bondNumbers || "Enter comma-separated numbers (e.g., 101, 102, 103)"}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                    Bond Range
                    <Tooltip title="Quickly add a sequence of bond numbers by specifying start and end values">
                      <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Range Start"
                        fullWidth
                        type="number"
                        InputProps={{
                          inputProps: { min: 1 },
                          startAdornment: <InputAdornment position="start">From</InputAdornment>,
                        }}
                        value={rangeStart}
                        onChange={(e) => {
                          setRangeStart(e.target.value);
                          if (errors.bondRange) {
                            setErrors((prev) => ({ ...prev, bondRange: "" }));
                          }
                        }}
                        error={!!errors.bondRange}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Range End"
                        fullWidth
                        type="number"
                        InputProps={{
                          inputProps: { min: 1 },
                          startAdornment: <InputAdornment position="start">To</InputAdornment>,
                        }}
                        value={rangeEnd}
                        onChange={(e) => {
                          setRangeEnd(e.target.value);
                          if (errors.bondRange) {
                            setErrors((prev) => ({ ...prev, bondRange: "" }));
                          }
                        }}
                        error={!!errors.bondRange}
                      />
                    </Grid>
                  </Grid>
                  {errors.bondRange && <FormHelperText error>{errors.bondRange}</FormHelperText>}
                </Box>

                <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddCategory}>
                  Add Category
                </Button>
              </Box>

              {errors.general && (
                <FormHelperText error sx={{ mt: 2 }}>
                  {errors.general}
                </FormHelperText>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DoneIcon />}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BondFormWithAutocomplete;
