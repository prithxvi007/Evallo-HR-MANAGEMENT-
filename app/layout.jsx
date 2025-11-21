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
              duration: 1500,
              style: {
                background: "hsl(var(--background) / 0.55)",
                marginTop: "60px",
                marginRight: "10px",
                color: "hsl(var(--foreground))",
                backdropFilter: "blur(18px) saturate(160%)",
                WebkitBackdropFilter: "blur(18px) saturate(160%)",
                border: "1px solid hsl(var(--border) / 0.35)",
                borderRadius: "14px",
                padding: "10px 14px",
                fontSize: "14px",
                boxShadow: "0 0 18px rgba(0,0,0,0.06)",
                animation: "fadeSlide 0.22s ease-out",
              },
              success: {
                style: {
                  background: "hsl(var(--primary) / 0.85)",
                  color: "hsl(var(--primary-foreground))",
                  border: "1px solid hsl(var(--primary) / 0.45)",
                },
              },
              error: {
                style: {
                  background: "hsl(var(--destructive) / 0.85)",
                  color: "hsl(var(--destructive-foreground))",
                  border: "1px solid hsl(var(--destructive) / 0.45)",
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
