import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "./providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TalentLens - Intelligent Talent Platform",
  description: "Next-generation talent intelligence platform powered by Turborepo, Next.js 16, Bun, and Hono.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
