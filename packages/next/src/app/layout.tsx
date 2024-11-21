import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from 'next/font/google'

import Provider from "@/components/Layout/QueryClientProvider";
import MainLayout from "@/components/Layout/MainLayout";
import { NavbarWrapper } from '@/components/Layout/NavbarWrapper'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Graham",
  description: "AI phone agents for growing businesses",
  icons: {
    icon:['/favicon.ico'],
    apple:['/apple-touch-icon.png'],
    shortcut:['/apple-touch-icon.png'],
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Analytics />
        <ClerkProvider afterSignOutUrl="/">
          <body className={`${inter.className}`}>
            <Provider>
              <NavbarWrapper />
              <MainLayout>
                {children}
                <SpeedInsights />
              </MainLayout>
            </Provider>
          </body>
        </ClerkProvider>
      </body>
    </html>
  );
}