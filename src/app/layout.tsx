import type { Metadata } from "next";
import "./globals.css";
import { auth } from "auth";
import { redirect } from "next/navigation";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "src/config/theme";

export const metadata: Metadata = {
  title: "Khata Management",
  description: "Khata Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) redirect("auth/signin");
  if (session)
    return (
      <html lang="en">
        {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={""} />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        /> */}

        <body>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
            <div style={{ position: "fixed", bottom: "10px", right: "10px", fontSize: "12px", opacity: 0.7 }}>
              Created by{" "}
              <a
                href="https://linkedin.com/in/saqlain1020"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "underline" }}
              >
                @saqlain1020
              </a>
            </div>
          </AppRouterCacheProvider>
        </body>
      </html>
    );
}
