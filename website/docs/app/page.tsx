"use client";;
import Hero from "@/components/hero-home";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export default function HomePage() {
  return (
    <div className={`w-full ${inter.variable} font-inter`}>
      <Hero />
    </div>
  );
}
