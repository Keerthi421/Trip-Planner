import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Compass AI – Your journey, perfectly crafted",
  description: "AI-powered travel planning with 6 specialized agents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#050818", color: "#f1f5f9" }}>
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
