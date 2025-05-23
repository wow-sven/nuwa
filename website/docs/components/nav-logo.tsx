"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function NavLogo() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkDark = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    setMounted(true);

    // 监听 class 变化
    const observer = new MutationObserver(() => {
      checkDark();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  const logoPath = isDark ? "/nuwa-logo-white.svg" : "/nuwa-logo-black.svg";
  return <Image src={logoPath} alt="Nuwa Logo" width={100} height={100} />;
}
