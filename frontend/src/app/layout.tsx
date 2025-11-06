import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-pop",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Forescene — Predict the Future. Prove You Were Right.",
  description: "Create and back short-form video or text predictions. Stake belief or doubt and build your on-chain reputation.",
  metadataBase: new URL("https://forescene.app"),
  icons: {
    icon: [{ url: "/logo2.png" }, { url: "/favicon.ico" }],
    shortcut: ["/logo2.png"],
    apple: ["/logo2.png"],
  },
  openGraph: {
    title: "Forescene",
    description: "Video + text predictions with staking. TikTok-style, on-chain reputation.",
    url: "https://forescene.app",
    siteName: "Forescene",
    images: [{ url: "/logo2.png" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forescene",
    description: "Video + text predictions with staking. TikTok-style, on-chain reputation.",
    images: ["/logo2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
