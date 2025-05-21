"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function NavLogo() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const logoPath =
    theme === "dark" ? "/nuwa-logo-white.svg" : "/nuwa-logo-black.svg";

  return <Image src={logoPath} alt="Nuwa Logo" width={100} height={100} />;
}
