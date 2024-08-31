import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Provider from "@/components/Layout/Provider";
import Layout from "@/components/Layout";
import { PreloaderProvider } from "@/components/Layout/PreloaderContext";
import { ThemeProvider } from "@/components/Layout/Theme-Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compadre",
  description: "Your AI compadre through and through",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className="dark">
        <Provider>
          <body className={inter.className}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
              <PreloaderProvider>
                <Layout>
                  {children}
                </Layout>
              </PreloaderProvider>
            </ThemeProvider>
          </body>
        </Provider>
      </html>
    </ClerkProvider>
  );
}