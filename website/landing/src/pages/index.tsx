import { FeatureToggles } from "@/components/feature-toggles/FeatureToggles";
import { Hero } from "@/components/hero/Hero";
import { Logos } from "@/components/logos/Logos";
import { ExpandableNavBar } from "@/components/navigation/ExpandableNavBar";
import { NAV_LINKS } from "@/components/navigation/DesktopLinks";
import { BenefitsGrid } from "@/components/benefits-grid/BenefitsGrid";
import { font } from "@/fonts";
import { BlogCarousel } from "@/components/blog/BlogCarousel";
import { FinalCTA } from "@/components/final-cta/FinalCTA";
import { Footer } from "@/components/footer/Footer";
import { getAllBlogPosts } from "@/lib/blog";
import { GetStaticProps } from "next";
import { BlogPost } from "@/lib/blog";
import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";
import { Usecases } from "@/components/supports/Usecases";
interface HomeProps {
  posts: BlogPost[];
}

// 定义淡入动画变体
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// 创建一个可重用的动画组件
const AnimatedSection = ({ children, delay = 0 }: { children: ReactNode, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

export default function Home({ posts }: HomeProps) {
  return (
    <main className={`${font.className} overflow-hidden`}>
      <ExpandableNavBar links={NAV_LINKS}>
        <AnimatedSection>
          <Hero />
        </AnimatedSection>
      </ExpandableNavBar>

      <AnimatedSection delay={0.1}>
        <Logos />
      </AnimatedSection>

      <div className="space-y-36 bg-zinc-50 pb-24 pt-24 md:pt-32">
        <AnimatedSection delay={0.2}>
          <FeatureToggles />
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <BenefitsGrid />
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <Usecases />
        </AnimatedSection>

        <AnimatedSection delay={0.5}>
          <BlogCarousel posts={posts} />
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.6}>
        <FinalCTA />
      </AnimatedSection>

      <AnimatedSection delay={0.7}>
        <Footer />
      </AnimatedSection>
    </main>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const posts = getAllBlogPosts();

  return {
    props: {
      posts,
    },
  };
};
