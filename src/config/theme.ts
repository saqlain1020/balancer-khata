"use client";
import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { Inter } from "next/font/google";

declare module "@mui/material/Divider" {
  interface DividerPropsVariantOverrides {
    light: true;
  }
}

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});
export const inter = Inter({ subsets: ["latin"] });
const themeColor = "rgb(182,255,0)";
// const themeColor = "#5ada86";
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: themeColor,
    },
    text: {
      primary: "rgb(230, 230, 230)",
    },
    background: {
      default: "rgb(40,40,40)",
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: "xl",
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: themeColor,
          color: "black",
        },
      },
    },
    MuiAccordion: {
      defaultProps: {
        slotProps: {
          transition: {
            unmountOnExit: true,
          },
        },
      },
    },
    MuiDivider: {
      variants: [
        {
          props: {
            variant: "light",
          },
          style: {
            borderColor: "rgb(210,210,210)",
          },
        },
      ],
    },
  },
});

export default theme;
