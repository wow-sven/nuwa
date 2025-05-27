"use client";
import useDarkMode from "@/hooks/use-dark-mode";
import Image from "next/image";

export default function NavLogo() {
  const isDark = useDarkMode();
  if (isDark === null) return null;
  const logoPath = isDark ? "/nuwa-logo-white.svg" : "/nuwa-logo-black.svg";
  return (
    <Image src={logoPath} alt="Nuwa Logo" width={100} height={100} priority />
  );
}
