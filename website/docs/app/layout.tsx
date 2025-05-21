/* eslint-env node */
import "@/globals.css";
import "nextra-theme-docs/style.css";
import { Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import NavLogo from "@/components/nav-logo";
import Footer from "@/components/footer";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "600", "800"],
});

export const metadata = {
  metadataBase: new URL("https://nuwa.dev"),
  title: {
    default: "Nuwa AI - Agent-Centric Future",
    template: "%s - Nuwa AI",
  },
  description:
    "Nuwa AI: Build the Agent-Centric Future with Agent Capability Protocol (ACP).",
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
    title: "Nuwa AI - Agent-Centric Future",
    description:
      "Nuwa AI: Build the Agent-Centric Future with Agent Capability Protocol (ACP).",
    type: "website",
    url: "https://nuwa.dev",
    images: [
      {
        url: "https://nuwa.dev/og-image.png",
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
    title: "Nuwa AI - Agent-Centric Future",
    description:
      "Nuwa AI: Build the Agent-Centric Future with Agent Capability Protocol (ACP).",
    images: ["https://nuwa.dev/og-image.png"],
  },
};

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={<NavLogo />}
      projectLink="https://github.com/nuwa-protocol/nuwa"
    />
  );
  const pageMap = await getPageMap();
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <meta name="apple-mobile-web-app-title" content="Nuwa AI" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body className={roboto.className}>
        <Layout
          navbar={navbar}
          footer={<Footer border={true} />}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/shuding/nextra/blob/main/examples/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
