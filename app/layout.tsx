import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `${SITE.title} — ${SITE.name}`,
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "telegram support",
    "customer support",
    "order assistance",
    "telegram bot",
    "contact admin",
    "custom requests",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    title: `${SITE.title} — ${SITE.name}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.title} — ${SITE.name}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  // Mini App / WebView friendly.
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans antialiased">
        {/* Skip link for keyboard and screen-reader users */}
        <a
          href="#support"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
        >
          Skip to support form
        </a>
        {children}
      </body>
    </html>
  );
}