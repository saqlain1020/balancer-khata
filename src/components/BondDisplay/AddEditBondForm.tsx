import React, { useState } from "react";
import { Person, BondCategory } from "../../types/bonds";
import {
  Box,
  Button,
  Card,
  CardContent,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CategoryIcon from "@mui/icons-material/Category";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";

interface AddEditBondFormProps {
  onSave: (person: Person) => void;
  editPerson?: Person | null;
}

const AddEditBondForm: React.FC<AddEditBondFormProps> = ({ onSave, editPerson = null }) => {
  const [open, setOpen] = useState(false);
  const [person, setPerson] = useState<Person>(() => {
    if (editPerson) {
      return { ...editPerson };
    }
    return {
      id: Date.now().toString(), // Simple ID generation
      name: "",
      categories: [],
    };
  });
  const [categoryName, setCategoryName] = useState("");
  const [bondNumbers, setBondNumbers] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (!editPerson) {
      // Reset the form if adding new
      setPerson({
        id: Date.now().toString(),
        name: "",
        categories: [],
      });
    } else {
      // Reset to the original data if editing
      setPerson({ ...editPerson });
    }
    setCategoryName("");
    setBondNumbers("");
    setErrors({});
    setExpandedCategory(null);
  };

  const handlePersonNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerson((prev) => ({ ...prev, name: e.target.value }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!person.name.trim()) {
      newErrors.name = "Person name is required";
    }

    if (categoryName.trim() && bondNumbers.trim()) {
      // Check if bond numbers are valid
      const isValid = /^(\d+)(\s*,\s*\d+)*$/.test(bondNumbers.trim());
      if (!isValid) {
        newErrors.bondNumbers = "Enter comma-separated numbers";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // Add any pending category before saving
      let updatedPerson = { ...person };
      if (categoryName.trim() && bondNumbers.trim()) {
        handleAddCategory();
      }

      // Validate that we have some categories
      if (person.categories.length === 0) {
        setErrors((prev) => ({ ...prev, general: "Add at least one category with bonds" }));
        return;
      }

      onSave(updatedPerson);
      handleClose();
    }
  };

  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      setErrors((prev) => ({ ...prev, categoryName: "Category name is required" }));
      return;
    }

    if (!bondNumbers.trim()) {
      setErrors((prev) => ({ ...prev, bondNumbers: "Enter at least one bond number" }));
      return;
    }

    // Validate bond numbers format
    const isValid = /^(\d+)(\s*,\s*\d+)*$/.test(bondNumbers.trim());
    if (!isValid) {
      setErrors((prev) => ({ ...prev, bondNumbers: "Enter comma-separated numbers" }));
      return;
    }

    // Parse bond numbers
    const numbers = bondNumbers
      .split(",")
      .map((num) => parseInt(num.trim(), 10))
      .filter((num) => !isNaN(num));

    if (numbers.length === 0) {
      setErrors((prev) => ({ ...prev, bondNumbers: "Enter valid numbers" }));
      return;
    }

    // Add the category
    setPerson((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          name: categoryName,
          bonds: numbers,
        },
      ],
    }));

    // Clear inputs and errors
    setCategoryName("");
    setBondNumbers("");
    setErrors({});
  };

  const handleDeleteCategory = (index: number) => {
    setPerson((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const handleCategoryNameChange = (index: number, newName: string) => {
    setPerson((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) => (i === index ? { ...cat, name: newName } : cat)),
    }));
  };

  const handleAddBondToCategory = (index: number, newBond: number) => {
    if (isNaN(newBond)) return;

    setPerson((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, bonds: [...cat.bonds, newBond].sort((a, b) => a - b) } : cat
      ),
    }));
  };

  const handleRemoveBondFromCategory = (categoryIndex: number, bondValue: number) => {
    setPerson((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === categoryIndex ? { ...cat, bonds: cat.bonds.filter((b) => b !== bondValue) } : cat
      ),
    }));
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={editPerson ? <EditIcon /> : <AddIcon />}
        onClick={handleOpen}
        sx={{ mb: 3 }}
      >
        {editPerson ? "Edit Bond Data" : "Add Bond Data"}
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editPerson ? "Edit Bond Data" : "Add New Bond Data"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Person name */}
            <TextField
              label="Person Name"
              fullWidth
              value={person.name}
              onChange={handlePersonNameChange}
              error={!!errors.name}
              helperText={errors.name}
            />

            {/* Categories section */}
            <Box>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Categories
              </Typography>

              {person.categories.length > 0 ? (
                <Box sx={{ mb: 3 }}>
                  {person.categories.map((category, index) => (
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
                          <TextField
                            label="Category Name"
                            size="small"
                            value={category.name}
                            onChange={(e) => handleCategoryNameChange(index, e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
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

                          <Box sx={{ display: "flex", gap: 1 }}>
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
                <TextField
                  label="Category Name"
                  fullWidth
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (errors.categoryName) {
                      setErrors((prev) => ({ ...prev, categoryName: "" }));
                    }
                  }}
                  error={!!errors.categoryName}
                  helperText={errors.categoryName}
                />

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
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} startIcon={<DoneIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddEditBondForm;
