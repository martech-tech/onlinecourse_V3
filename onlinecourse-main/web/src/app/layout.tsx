import type { Metadata } from "next";
import { Suspense } from 'react';
import "./globals.css";
import FlowbiteInit from "../lib/flowbite-init";
import Providers from "./providers";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "J Knowledge Online Course",
  description: "คอร์สเรียนออนไลน์ J Knowledge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Suspense fallback={null}>
          <FlowbiteInit />
        </Suspense>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
