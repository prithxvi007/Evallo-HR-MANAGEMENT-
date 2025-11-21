
import { Toaster } from "react-hot-toast";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist'
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
});

export const metadata = {
  title: "Evallo - Modern HRMS",
  description: "Evallo: Premium Human Resource Management System.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <body className={`${geist.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 1500,
              style: {
                background: "rgba(255, 255, 255, 0.95)",
                marginTop: "60px",
                marginRight: "10px",
                color: "#1a1a1a",
                backdropFilter: "blur(18px) saturate(160%)",
                WebkitBackdropFilter: "blur(18px) saturate(160%)",
                border: "1px solid rgba(226, 232, 240, 0.35)",
                borderRadius: "14px",
                padding: "12px 16px",
                fontSize: "14px",
                boxShadow: "0 0 18px rgba(0,0,0,0.06)",
                fontFamily: 'var(--font-geist)',
              },
              success: {
                style: {
                  background: "rgba(34, 197, 94, 0.95)",
                  color: "white",
                  border: "1px solid rgba(34, 197, 94, 0.45)",
                },
              },
              error: {
                style: {
                  background: "rgba(239, 68, 68, 0.95)",
                  color: "white",
                  border: "1px solid rgba(239, 68, 68, 0.45)",
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