import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { Button } from "../shared/Button";
import { motion } from "framer-motion";
import { OPTIONS } from "../supports/options";

const HERO_TEXTS = {
  huntBadge: "New!",
  huntText: "Early Access Now Open!",
  heading: "Secured Intelligence for",
  subheading: "Empowering Web3 protocols with Agent-as-a-Service (AaaS) that simplify user experience and unlock new capabilities—zero technical overhead required",
  ctaButton: "Join Early Access"
};

const ONE_SECOND = 1000;
const WAIT_TIME = ONE_SECOND * 3;

interface AnimatedTextProps {
  phrases: string[];
}

const AnimatedText = ({ phrases }: AnimatedTextProps) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const intervalRef = setInterval(() => {
      setActive((pv) => (pv + 1) % phrases.length);
    }, WAIT_TIME);

    return () => clearInterval(intervalRef);
  }, [phrases]);

  // 为每个短语定义不同的颜色
  const phraseColors = [
    "text-emerald-600", // DeFi - 绿色代表金融和增长
    "text-blue-600",    // Launchpad - 蓝色代表信任和稳定
    "text-purple-600",  // GameFi - 紫色代表创新和游戏
    "text-amber-600",   // DEX - 琥珀色代表活力和交易
    "text-rose-600",    // Money Market - 玫瑰色代表财富和繁荣
  ];

  return (
    <div className="relative mb-14 mt-2 w-full">
      {phrases.map((phrase: string, index: number) => {
        const isActive = phrases[active] === phrase;
        return (
          <motion.div
            key={phrase}
            initial={false}
            animate={isActive ? "active" : "inactive"}
            style={{
              x: "-50%",
            }}
            variants={{
              active: {
                opacity: 1,
                scale: 1,
              },
              inactive: {
                opacity: 0,
                scale: 0,
              },
            }}
            className={`absolute left-1/2 top-0 w-full ${phraseColors[index]}`}
          >
            {phrase}
          </motion.div>
        );
      })}
    </div>
  );
};

export const Copy = () => {
  // 从OPTIONS中提取标题作为动画文本的phrases
  const phrases = OPTIONS.map(option => option.title);

  // 添加滚动到CTA部分的函数
  const scrollToCTA = () => {
    // 使用id选择器精确定位CTA部分
    const ctaSection = document.getElementById('final-cta');
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="mb-1.5 rounded-full bg-zinc-600">
        <Link
          href="#final-cta"
          onClick={(e) => {
            e.preventDefault();
            scrollToCTA();
          }}
          className="flex origin-top-left items-center rounded-full border border-zinc-900 bg-white p-0.5 text-sm transition-transform hover:-rotate-2"
        >
          <span className="rounded-full bg-[#FF6154] px-2 py-0.5 font-medium text-white">
            {HERO_TEXTS.huntBadge}
          </span>
          <span className="ml-1.5 mr-1 inline-block">
            {HERO_TEXTS.huntText}
          </span>
          <FiArrowUpRight className="mr-2 inline-block" />
        </Link>
      </div>
      <h1 className="max-w-4xl text-center text-4xl font-black leading-[1.15] md:text-7xl md:leading-[1.15] mb-8">
        <span className="relative">
          Secured
          <svg
            viewBox="0 0 286 73"
            fill="none"
            className="absolute -left-2 -right-2 -top-2 bottom-0 translate-y-1"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{
                duration: 1.25,
                ease: "easeInOut",
              }}
              d="M142.293 1C106.854 16.8908 6.08202 7.17705 1.23654 43.3756C-2.10604 68.3466 29.5633 73.2652 122.688 71.7518C215.814 70.2384 316.298 70.689 275.761 38.0785C230.14 1.37835 97.0503 24.4575 52.9384 1"
              stroke="#F59E0B"
              strokeWidth="3"
            />
          </svg>
        </span>{" "}
        Intelligence for
        <AnimatedText phrases={phrases} />
      </h1>
      <p className="mx-auto my-4 max-w-3xl text-center text-base leading-relaxed md:my-6 md:text-2xl md:leading-relaxed">
        {HERO_TEXTS.subheading}
      </p>
      <Button onClick={scrollToCTA}>
        <span className="font-bold">{HERO_TEXTS.ctaButton}</span>
      </Button>
    </>
  );
};
