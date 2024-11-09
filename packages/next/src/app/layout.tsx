import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from 'next/font/google'

import Provider from "@/components/Layout/QueryClientProvider";
import MainLayout from "@/components/Layout/MainLayout";
import { Navbar } from "@/components/Layout/Navbar";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Graham",
  description: "AI phone agents for growing small businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Analytics />
      <ClerkProvider afterSignOutUrl="/">
        <html lang="en" className="light">
        <body className={`${inter.className}`}>
          <Provider>
            <Navbar />
            <MainLayout>
              {children}
              <SpeedInsights />
            </MainLayout>
          </Provider>
        </body>
      </html>
      </ClerkProvider>
    </>
  );
}