import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Provider from "@/components/Layout/QueryClientProvider";
import MainLayout from "@/components/Layout/MainLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Graham",
  description: "AI phone agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className="dark">
        <body className={inter.className}>
          <Provider>
            <MainLayout>
              {children}
            </MainLayout>
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}