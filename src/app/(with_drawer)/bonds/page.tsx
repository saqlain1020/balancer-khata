"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Paper,
  Grid,
  AlertTitle,
} from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ListIcon from "@mui/icons-material/List";
import ViewComfyIcon from "@mui/icons-material/ViewComfy";
import LinkIcon from "@mui/icons-material/Link";
import LaunchIcon from "@mui/icons-material/Launch";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BondDisplay from "../../../components/BondDisplay";
import BondChips from "../../../components/BondDisplay/BondChips";
import BondFormWithAutocomplete from "../../../components/BondDisplay/BondFormWithAutocomplete";
import BondsList from "../../../components/BondDisplay/BondsList";
import { getBonds } from "../../actions/bond";
import { IBond, IBondCategory } from "../../../../lib/models/Bond";

interface BondData {
  _id: string;
  customer: string;
  categories: IBondCategory[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bonds-tabpanel-${index}`}
      aria-labelledby={`bonds-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BondsPage() {
  const [displayMode, setDisplayMode] = useState<"text" | "chips">("text");
  const [tabValue, setTabValue] = useState(0);
  const [bondData, setBondData] = useState<BondData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Prize checking links
  const prizeCheckingLinks = [
    {
      title: "Central Directorate of National Savings (CDNS)",
      url: "https://www.savings.gov.pk/latest/results.php#focus",
      description: "Official prize bond draw results and verification service",
    },
  ];

  // Load bond data from MongoDB
  const loadBondData = async () => {
    setLoading(true);
    try {
      const data = await getBonds();
      setBondData(data);
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.message || "Failed to load bond data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadBondData();
  }, []);

  const handleDisplayModeChange = (event: React.MouseEvent<HTMLElement>, newMode: "text" | "chips") => {
    if (newMode !== null) {
      setDisplayMode(newMode);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Map MongoDB data to the format expected by BondDisplay components
  const mapToBondDisplayFormat = (data: BondData[]) => {
    return data.map((bond) => ({
      id: bond._id,
      name: bond.customer,
      categories: bond.categories,
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading bond data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight={600}>
          Bonds Management
        </Typography>

        <BondFormWithAutocomplete onComplete={loadBondData} />
      </Box>

      {/* Tabs navigation */}
      <Card sx={{ mb: 4, backgroundColor: "background.paper" }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<ListIcon />} label="MANAGE" />
            <Tab icon={<ViewComfyIcon />} label="DISPLAY" />
            <Tab icon={<EmojiEventsIcon />} label="CHECK PRIZES" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Tab content */}
      <TabPanel value={tabValue} index={0}>
        <BondsList bonds={bondData} onBondUpdated={loadBondData} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card sx={{ mb: 4, backgroundColor: "background.paper" }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" fontWeight={500}>
                View Options
              </Typography>

              <ToggleButtonGroup
                value={displayMode}
                exclusive
                onChange={handleDisplayModeChange}
                aria-label="display mode"
                size="small"
              >
                <ToggleButton value="text" aria-label="text view">
                  <FormatListBulletedIcon />
                </ToggleButton>
                <ToggleButton value="chips" aria-label="chips view">
                  <ViewModuleIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </CardContent>
        </Card>

        {bondData.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 4, bgcolor: "background.paper", borderRadius: 1 }}>
            <Typography variant="h6" color="text.secondary">
              No bond data available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add your first bond using the &quot;Add Bond Data&quot; button above
            </Typography>
          </Box>
        ) : displayMode === "text" ? (
          <BondDisplay people={mapToBondDisplayFormat(bondData)} />
        ) : (
          <BondChips people={mapToBondDisplayFormat(bondData)} />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
          <Typography variant="h6" fontWeight={500} gutterBottom>
            Check Your Prize Bonds
          </Typography>

          <Typography variant="body1" paragraph>
            Use this official resource to check if your bond numbers have won any prizes:
          </Typography>

          <List>
            {prizeCheckingLinks.map((link, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  component="a"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    textDecoration: "none",
                    color: "text.primary",
                    borderRadius: 1,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      bgcolor: "action.hover",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <ListItemIcon>
                    <LinkIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {link.title}
                        <LaunchIcon sx={{ ml: 1, fontSize: "0.8rem", color: "text.secondary" }} />
                      </Box>
                    }
                    secondary={link.description}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </TabPanel>

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
    </Box>
  );
}
