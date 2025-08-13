/* eslint-env node */
import "nextra-theme-docs/style.css";
import "@/globals.css";
import { Inter } from "next/font/google";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Layout, Navbar } from "nextra-theme-docs";
import Background from "@/components/background";
import ChatModalButton from "@/components/chat-modal-button";
import Footer from "@/components/footer";
import NavLogo from "@/components/nav-logo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "700"],
});

export const metadata = {
  metadataBase: new URL("https://docs.nuwa.dev"),
  title: {
    default: "Nuwa AI - Documentation",
    template: "%s - Nuwa AI",
  },
  description: "Nuwa AI official documentation website.",
  keywords: [
    "Nuwa",
    "Agent",
    "AI",
    "Protocol",
    "Capability",
    "ACP",
    "Super Agent",
    "Developer",
    "Open Ecosystem",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: "Nuwa",
    locale: "en_US",
    title: "Nuwa AI - Documentation",
    description: "Nuwa AI official documentation website.",
    type: "website",
    url: "https://docs.nuwa.dev",
    images: [
      {
        url: "https://docs.nuwa.dev/og-image.png",
        alt: "Nuwa Protocol Open Graph Image",
        type: "image/png",
        width: 1200,
        height: 630,
      },
    ],
    // Article meta (Open Graph extension)
    publishedTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    authors: ["Nuwa Team"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@NuwaDev",
    creator: "@NuwaDev",
    title: "Nuwa AI - Documentation",
    description: "Nuwa AI official documentation website.",
    images: ["https://docs.nuwa.dev/og-image.png"],
  },
};

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar logo={<NavLogo />} projectIcon={null} align="left">
      <ChatModalButton />
    </Navbar>
  );
  const pageMap = await getPageMap();
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <meta name="apple-mobile-web-app-title" content="Nuwa AI" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body className={inter.className}>
        <Layout
          navbar={navbar}
          footer={<Footer />}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/nuwa-protocol/nuwa/tree/main/website/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
        >
          <Background>{children}</Background>
        </Layout>
      </body>
    </html>
  );
}
