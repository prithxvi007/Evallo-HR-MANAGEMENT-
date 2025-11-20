import { Toaster } from "react-hot-toast";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Evallo - Modern HRMS",
  description: "Evallo: Premium Human Resource Management System.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 2000,
              style: {
                background: "hsl(var(--muted))",
                color: "hsl(var(--muted-foreground))",
                borderRadius: "6px",
                padding: "12px 14px",
                fontSize: "14px",
                border: "none",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              },

              success: {
                style: {
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                },
              },

              error: {
                style: {
                  background: "hsl(var(--destructive))",
                  color: "hsl(var(--destructive-foreground))",
                },
              },
            }}
          />

          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
