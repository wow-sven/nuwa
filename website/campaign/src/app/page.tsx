'use client'

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GridHoverHero } from "@/app/components/hero/GridHoverHero";
import { Chat } from "@/app/components/chat/Chat";
import { motion } from "framer-motion";
import { BarLoader } from "@/app/components/shared/BarLoader";

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

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <BarLoader />
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <GridHoverHero />;
  }

  return (
    <main className="container mx-auto px-2 sm:px-4 sm:py-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="max-w-6xl mx-auto sm:mt-10 md:mt-20"
      >
        <div className="w-full">
          <Chat />
        </div>
      </motion.div>
    </main>
  );
} 