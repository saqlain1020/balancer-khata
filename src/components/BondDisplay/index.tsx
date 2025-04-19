import React from "react";
import { Person, BondCategory } from "../../types/bonds";
import { formatBonds } from "../../utils/bondUtils";
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
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CategoryIcon from "@mui/icons-material/Category";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

interface BondDisplayProps {
  people: Person[];
}

const BondDisplay: React.FC<BondDisplayProps> = ({ people }) => {
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
        Bond Information
      </Typography>

      <Grid container spacing={3}>
        {people.map((person) => (
          <Grid item xs={12} md={6} key={person.id}>
            <Card
              sx={{
                height: "100%",
                backgroundColor: "background.paper",
                borderRadius: 2,
                boxShadow: 3,
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
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CategoryIcon sx={{ mr: 1 }} />
                        <Typography fontWeight={500}>
                          {category.name} ({category.bonds.length})
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 2, backgroundColor: "rgba(40, 40, 40, 0.9)" }}>
                      <BondCategoryDisplay category={category} />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

interface BondCategoryDisplayProps {
  category: BondCategory;
}

const BondCategoryDisplay: React.FC<BondCategoryDisplayProps> = ({ category }) => {
  if (!category.bonds || category.bonds.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No bonds in this category
      </Typography>
    );
  }

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          backgroundColor: "rgba(50, 50, 50, 0.4)",
          fontFamily: "monospace",
        }}
      >
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{formatBonds(category.bonds)}</Typography>
      </Paper>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Chip label={`Total: ${category.bonds.length}`} color="primary" size="small" sx={{ fontWeight: 500 }} />
      </Box>
    </Box>
  );
};

export default BondDisplay;
