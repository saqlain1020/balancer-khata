"use client";

import PersistentDrawerLeft from "src/components/Drawer/Drawer";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <PersistentDrawerLeft>
        {children} <ProgressBar height="4px" color="white" options={{ showSpinner: false }} shallowRouting />
      </PersistentDrawerLeft>
    </LocalizationProvider>
  );
}
