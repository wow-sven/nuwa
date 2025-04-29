import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/providers/Providers";
import { NavigationWrapper } from "./components/navigation/NavigationWrapper";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { MobileNavProvider } from "@/app/components/navigation/MobileNavContext";
import { MessagesProvider } from "@/app/context/MessagesContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nuwa Campaign",
  description: "A campaign platform for Nuwa",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nuwa Campaign",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="application-name" content="Nuwa Campaign" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nuwa Campaign" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} h-dvh`}>
        <Providers>
          <MobileNavProvider>
            <MessagesProvider>
              <NavigationWrapper>
                {children}
              </NavigationWrapper>
              <PWAInstallPrompt />
            </MessagesProvider>
          </MobileNavProvider>
        </Providers>
      </body>
    </html>
  );
}
