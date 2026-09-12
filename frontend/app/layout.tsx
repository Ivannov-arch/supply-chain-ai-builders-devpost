import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { DevModeProvider } from "@/context/DevModeContext";
import DevAuthModal from "@/components/DevAuthModal";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ShipSafe AI — Cross-Border Supply Chain Risk Predictor",
  description:
    "AI-powered customs delay prediction using XGBoost, SHAP explainability, and Google Gemini. Predict shipment risks, understand feature impacts, and get actionable mitigation plans.",
  keywords: [
    "supply chain",
    "risk prediction",
    "customs delay",
    "XGBoost",
    "SHAP",
    "Gemini AI",
    "cross-border trade",
  ],
  authors: [{ name: "ShipSafe AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <DevModeProvider>
          <Navbar />
          <DevAuthModal />
          <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
        </DevModeProvider>
      </body>
    </html>
  );
}
