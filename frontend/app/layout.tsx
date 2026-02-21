import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../app/globals.css";
import { QueryProvider } from "@/components/ui/QueryProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MaTriX-AI — Maternal Triage Intelligence",
  description: "Hybrid Edge–Cloud Multi-Agent Maternal Risk Escalation System powered by MedGemma",
  keywords: ["maternal health", "AI triage", "MedGemma", "clinical AI"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`} style={{ background: "var(--bg-base, #050811)", color: "#e2e8f0" }}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
