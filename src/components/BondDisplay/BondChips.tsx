import React, { useState } from "react";
import { Person, BondCategory } from "../../types/bonds";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CategoryIcon from "@mui/icons-material/Category";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface BondChipsProps {
  people: Person[];
  chipColors?: boolean; // Whether to use different colors for ranges vs individual bonds
}

// Helper function to determine if a number is part of a range of 5 or more consecutive numbers
const isPartOfRange = (number: number, bonds: number[]): boolean => {
  const sortedBonds = [...bonds].sort((a, b) => a - b);

  // Find sequences of consecutive numbers
  let start = number;
  let count = 1;

  // Count consecutive numbers before current
  let i = number - 1;
  while (sortedBonds.includes(i)) {
    count++;
    i--;
  }

  // Count consecutive numbers after current
  i = number + 1;
  while (sortedBonds.includes(i)) {
    count++;
    i++;
  }

  return count >= 5;
};

const BondChips: React.FC<BondChipsProps> = ({ people, chipColors = true }) => {
  const theme = useTheme();
  // Add state for copy notification
  const [copyNotification, setCopyNotification] = useState({
    open: false,
    message: "",
  });

  const handleCopyBonds = (bonds: number[]) => {
    // Create comma-separated string from bond numbers
    const bondString = bonds.join(",");

    // Copy to clipboard
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

  if (!people || people.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No bond data available
      </Typography>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Bond Information (Chips View)
      </Typography>

      <Grid container spacing={3}>
        {people.map((person) => (
          <Grid item xs={12} key={person.id}>
            <Card
              sx={{
                backgroundColor: "background.paper",
                borderRadius: 2,
                boxShadow: 3,
                mb: 3,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AccountBoxIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight={500}>
                    {person.name}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {person.categories.map((category, index) => (
                  <Accordion
                    key={index}
                    defaultExpanded={index === 0}
                    sx={{
                      mb: 1,
                      "&:before": { display: "none" },
                      boxShadow: 1,
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: "primary.main",
                        color: "black",
                        borderRadius: "4px 4px 0 0",
                        "&.Mui-expanded": {
                          borderRadius: "4px 4px 0 0",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <CategoryIcon sx={{ mr: 1 }} />
                        <Typography fontWeight={500}>
                          {category.name} ({category.bonds.length})
                        </Typography>
                        <Tooltip title="Copy all bond numbers">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent accordion from toggling
                              handleCopyBonds(category.bonds);
                            }}
                            sx={{
                              ml: 2,
                              p: 0.5,
                              color: "rgba(0, 0, 0, 0.7)",
                              "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.1)",
                                color: "rgba(0, 0, 0, 1)",
                              },
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 2, backgroundColor: "rgba(40, 40, 40, 0.9)" }}>
                      <CategoryChips category={category} chipColors={chipColors} />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

interface CategoryChipsProps {
  category: BondCategory;
  chipColors: boolean;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ category, chipColors }) => {
  const theme = useTheme();

  if (!category.bonds || category.bonds.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No bonds in this category
      </Typography>
    );
  }

  // Sort bonds numerically
  const sortedBonds = [...category.bonds].sort((a, b) => a - b);

  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {sortedBonds.map((bond) => {
          const isRange = chipColors && isPartOfRange(bond, category.bonds);

          return (
            <Chip
              key={bond}
              label={bond}
              sx={{
                fontWeight: "medium",
                color: isRange ? "black" : undefined,
                backgroundColor: isRange ? theme.palette.primary.main : "rgba(60, 60, 60, 0.9)",
                borderColor: isRange ? theme.palette.primary.dark : "rgba(100, 100, 100, 0.5)",
                border: "1px solid",
                "&:hover": {
                  backgroundColor: isRange ? theme.palette.primary.light : "rgba(80, 80, 80, 0.9)",
                },
              }}
            />
          );
        })}
      </Box>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Chip label={`Total: ${category.bonds.length}`} color="primary" size="small" sx={{ fontWeight: 500 }} />
      </Box>
    </Box>
  );
};

export default BondChips;
