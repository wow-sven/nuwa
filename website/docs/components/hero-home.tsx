import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "./ui/button";
import { CategoryCard } from "./category-card";
import { BookOpenIcon, CodeIcon, ServerIcon } from "lucide-react";

export default function HeroHome() {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/hero-bg.png"
          alt="Hero background with gradient colors"
          fill
          className="object-cover opacity-50"
          priority
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-white/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-8 lg:px-16 xl:px-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* New Badge */}
            <motion.div
              className="mb-6 inline-flex"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <div className="mb-1.5 rounded-full bg-zinc-600">
                <a
                  href="https://test-app.nuwa.dev/"
                  target="_blank"
                  rel="nofollow"
                  className="flex origin-top-left items-center rounded-full border border-zinc-900 bg-white p-0.5 text-sm transition-transform hover:-rotate-2"
                >
                  <span className="rounded-full bg-violet-500 px-2 py-0.5 font-medium text-white">
                    New
                  </span>
                  <span className="ml-1.5 mr-1.5 inline-block">
                    Nuwa Beta Live!
                  </span>
                </a>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="mb-6 text-5xl lg:text-6xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Nuwa AI Documentation
            </motion.h1>

            {/* Description */}
            <motion.p
              className="mb-8 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Comprehensive Nuwa AI documentation covering fundamental concepts, protocol designs and Cap development.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Button variant="secondary" className="font-semibold">
                Concepts
              </Button>
              <span className="text-gray-500">or</span>
              <Button variant="primary" className="font-semibold">
                Build a Cap
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Explore by Categories Section */}
        <section className="px-8 lg:px-16 xl:px-24 pb-20">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl font-bold text-gray-900 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Explore by categories
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <CategoryCard
                title="Concepts"
                href="/concepts"
                description="Learn Nuwa's core concepts, protocol designs and Cap development."
                icon={<BookOpenIcon className="w-6 h-6 text-blue-600" />}
                delay={0.9}
              />


              <CategoryCard
                title="Cap Development"
                href="/cap-development"
                description="Learn how to build and launch your own Nuwa Cap."
                icon={<CodeIcon className="w-6 h-6 text-green-600" />}
                delay={1.0}
              />



              <CategoryCard
                title="Protocol"
                href="/protocol"
                description="Explore Nuwa's protocol designs and how to use them."
                icon={<ServerIcon className="w-6 h-6 text-orange-600" />}
                delay={1.1}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
