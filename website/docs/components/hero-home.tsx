"use client";

import { Button } from "../components/ui/button";
import { CategoryCard } from "../components/category-card";
import { BookOpenIcon, CodeIcon, ServerIcon } from "lucide-react";

export default function HeroHome() {
  return (
    <div className="relative min-h-screen">
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-8 pb-16 px-8 lg:px-16 xl:px-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* New Badge */}
            <div className="mb-6 inline-flex">
              <div className="mb-1.5 rounded-full bg-zinc-600 dark:bg-zinc-400">
                <a
                  href="https://test-app.nuwa.dev/"
                  target="_blank"
                  rel="nofollow"
                  className="flex origin-top-left items-center rounded-full border border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-800 p-0.5 text-sm transition-transform hover:-rotate-2"
                >
                  <span className="rounded-full bg-violet-500 px-2 py-0.5 font-medium text-white">
                    New
                  </span>
                  <span className="ml-1.5 mr-1.5 inline-block text-zinc-900 dark:text-zinc-100">
                    Nuwa Beta Live!
                  </span>
                </a>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="mb-6 text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Nuwa AI Documentation
            </h1>

            {/* Description */}
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Comprehensive Nuwa AI documentation covering fundamental concepts, protocol designs and Cap development.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* <Button variant="secondary" className="font-semibold">
                Concepts
              </Button>
              <span className="text-gray-500 dark:text-gray-400">or</span> */}
              <Button onClick={() => {
                window.location.href = "/quick-start";
              }} variant="primary" className="font-semibold">
                Launch a Cap
              </Button>
            </div>
          </div>
        </section>

        {/* Explore by Categories Section */}
        <section className="px-8 lg:px-16 xl:px-24 pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
              Explore by categories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CategoryCard
                title="Concepts"
                href="/concepts"
                description="Learn Nuwa's core concepts and features."
                icon={<BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                delay={0.9}
              />

              <CategoryCard
                title="Cap Development"
                href="/cap-development"
                description="Learn how to build and launch your own Nuwa Cap."
                icon={<CodeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />}
                delay={1.0}
              />

              <CategoryCard
                title="Protocol"
                href="/protocol"
                description="Explore Nuwa's protocol designs and how to use them."
                icon={<ServerIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
                delay={1.1}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}