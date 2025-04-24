import React from "react";
import { motion } from "framer-motion";
import { IntegrationsBlock } from "./IntegrationsBlock";
import { CollaborateBlock } from "./CollaborateBlock";
import { HighlighBlocks } from "./HighlighBlocks";
import { SectionHeading } from "../shared/SectionHeading";
import { SectionSubheading } from "../shared/SectionSubheading";

const BENEFITS_GRID_TEXTS = {
  heading: "Why Choose Nuwa for Your Web3 Protocol",
  subheading: "Nuwa makes your protocol smarter, more intuitive, and ready for mass adoption — without the need for complex backend work or infrastructure overhead.",
};

const BenefitsGrid = () => {
  return (
    <motion.section
      transition={{
        staggerChildren: 0.1,
      }}
      initial="initial"
      whileInView="whileInView"
      className="relative mx-auto grid max-w-6xl grid-cols-3 gap-4 px-2 md:px-4"
    >
      <div className="col-span-3 flex w-full flex-col items-center justify-center text-center">
        <SectionHeading>{BENEFITS_GRID_TEXTS.heading}</SectionHeading>
        <SectionSubheading>
          {BENEFITS_GRID_TEXTS.subheading}
        </SectionSubheading>
      </div>
      <IntegrationsBlock />
      <CollaborateBlock />
      <HighlighBlocks />
    </motion.section>
  );
};

export default BenefitsGrid;
