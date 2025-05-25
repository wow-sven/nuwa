import Link from "next/link";
import { FiUpload, FiLock, FiDatabase, FiArrowRight } from "react-icons/fi";
import NuwaLogoThree from "./nuwa-logo-three";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ErrorBoundary from "@/components/error-boundary";
// Content constants
const HERO_CONTENT = {
  title: (
    <>
      Build the <span className="font-bold">Agent-Centric Future</span>
      <br />
      with{" "}
      <span className="line-through text-slate-400 dark:text-slate-500">
        App
      </span>
      <span className="mx-2 text-2xl font-bold text-purple align-middle">
        →
      </span>
      <span className="font-bold text-purple-600">Cap</span>
    </>
  ),
  subtitle: (
    <>
      Nuwa introduces Agent Capability Protocol (ACP) for building Caps -
      services that are indexable, payable, executable by AI agents.
    </>
  ),
  features: [
    {
      icon: <FiUpload className="w-7 h-7" />,
      title: "One Agent. Infinite Caps. ",
      description:
        "Skip the app-switching. Just tell your agent what you want — it'll use the right tools, APIs, or services to deliver.",
    },
    {
      icon: <FiLock className="w-7 h-7" />,
      title: "Secure Identity & Payments.",
      description:
        "Your agent can verify you, pay on your behalf, and protect your data across devices — with built-in trust.",
    },
    {
      icon: <FiDatabase className="w-7 h-7" />,
      title: "Open Ecosystem.",
      description:
        "Zero paltform fees. Build a monetizable Cap and earn 100% of its value",
    },
  ],
};

export default function HeroHome() {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // 动画时长 = delay(0.7s) + duration(0.7s)
    const timer = setTimeout(() => setShowLogo(true), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-auto min-h-[calc(100vh-230px)] overflow-hidden mx-auto max-w-7xl px-2 sm:px-4 pb-8 pt-10 md:pt-20">
      {/* Title */}
      <motion.h1
        className="mb-4 text-3xl sm:text-4xl md:text-6xl font-bold leading-snug sm:leading-tight text-slate-900 text-left w-full dark:text-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7 }}
      >
        {HERO_CONTENT.title}
      </motion.h1>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-20">
        {/* Left: Button and Content */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col items-start"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <p className="mb-6 text-base sm:text-lg text-gray-700 md:pr-8 text-left w-full dark:text-gray-300">
            {HERO_CONTENT.subtitle}
          </p>
          {/* Button */}
          <div className="flex justify-start w-full mb-4">
            <Link
              className="btn px-5 py-2 sm:px-8 sm:py-3 rounded-lg bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-all text-base sm:text-lg font-semibold"
              href="/docs"
            >
              <span className="inline-flex items-center">
                Learn More{" "}
                <span className="ml-2 text-fuchsia-300 font-bold">
                  <FiArrowRight size={20} />
                </span>
              </span>
            </Link>
          </div>
          {/* Feature List */}
          <div className="mt-2 space-y-4 text-left w-full">
            {HERO_CONTENT.features.map((feature, idx) => (
              <div className="flex items-start gap-3" key={idx}>
                {/* Icon */}
                <span className="mt-1 text-purple-600">{feature.icon}</span>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                    {feature.title}
                  </span>
                  <span className="text-gray-600 ml-1 dark:text-gray-300 text-sm sm:text-base">
                    {feature.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        {/* Right: Logo */}
        <motion.div
          className="hidden md:flex w-full md:w-1/2 -mt-40 -ml-10 justify-center items-center z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.7 }}
        >
          <ErrorBoundary>{showLogo && <NuwaLogoThree />}</ErrorBoundary>
        </motion.div>
      </div>
    </section>
  );
}
