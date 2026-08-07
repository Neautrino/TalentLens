import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "./providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TalentLens - Candidate Resume & Talent Portal",
  description: "Minimalist talent management and resume upload portal powered by Next.js 16, Bun, and MinIO storage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${inter.variable} font-sans bg-slate-50 text-slate-900 antialiased selection:bg-indigo-600 selection:text-white min-h-screen`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
