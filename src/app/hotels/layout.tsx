import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Hotels in Bishoftu — Bishoftu City Tourism",
  description:
    "Browse every approved hotel, resort, motel and lodge in Bishoftu, Ethiopia — lakeside resorts to central business hotels, with live room availability from the Guesthouse Management System.",
};

export default function HotelsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
