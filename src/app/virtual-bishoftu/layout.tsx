import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Virtual Bishoftu — See Bishoftu Before You Arrive",
  description:
    "Explore Bishoftu's seven crater lakes, Irecha festival, hot springs, and resorts through 360° tours, photo galleries, and interactive guides. Plan your visit to Oromia's Lake City.",
};

export default function VirtualBishoftuLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
