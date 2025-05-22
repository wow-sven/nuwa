"use client";
import { useThemeConfig } from "nextra-theme-docs";
import Image from "next/image";

export default function NavLogo() {
  const { darkMode } = useThemeConfig();

  const logoPath = darkMode ? "/nuwa-logo-white.svg" : "/nuwa-logo-black.svg";

  return <Image src={logoPath} alt="Nuwa Logo" width={100} height={100} />;
}
