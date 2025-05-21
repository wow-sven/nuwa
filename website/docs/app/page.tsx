"use client";
import Hero from "@/components/hero-home";
import { motion } from "framer-motion";
import PageIllustration from "@/components/page-illustration";

export default function HomePage() {
  return (
    <div className="w-full mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeIn" }}
      >
        <Hero />
      </motion.div>
      <PageIllustration />
    </div>
  );
}
