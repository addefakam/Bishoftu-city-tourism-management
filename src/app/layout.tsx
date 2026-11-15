import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bishoftu City Tourism Management System",
  description:
    "Unified digital platform for Bishoftu City's tourism and hospitality ecosystem — connecting visitors, hotels, the Tourism Office, and authorized public services. Powered by an AI Tourism Assistant.",
  keywords: ["Bishoftu", "Debre Zeit", "Oromia", "Ethiopia", "Tourism", "Lakes", "Crater Lakes", "Irecha", "Resort"],
  authors: [{ name: "Bishoftu City Culture & Tourism Office" }],
  openGraph: {
    title: "Bishoftu City Tourism Management System",
    description: "Oromia's Lake City — official tourism, hotel, and hospitality platform.",
    siteName: "Bishoftu Tourism",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bishoftu Tourism",
    description: "Oromia's Lake City — official tourism, hotel, and hospitality platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
