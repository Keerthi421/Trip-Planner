"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isHome = path === "/";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled || !isHome
          ? "rgba(5,8,24,0.85)"
          : "transparent",
        backdropFilter: scrolled || !isHome ? "blur(20px)" : "none",
        borderBottom: scrolled || !isHome ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl transition-transform group-hover:rotate-12">🧭</span>
          <span className="font-extrabold text-lg tracking-tight text-white">
            Compass<span style={{ color: "#60a5fa" }}> AI</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="/#features"      className="hover:text-white transition-colors">Features</Link>
          <Link href="/#destinations"  className="hover:text-white transition-colors">Destinations</Link>
          <Link href="/#pricing"       className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/trips"          className={`hover:text-white transition-colors ${path === "/trips" ? "text-white" : ""}`}>My Trips</Link>
        </div>

        {/* CTA */}
        <Link
          href="/plan"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            boxShadow: "0 0 20px rgba(139,92,246,0.3)",
          }}
        >
          Start Planning ✈️
        </Link>
      </div>
    </nav>
  );
}
