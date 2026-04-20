'use client';

import "./globals.css";

import { ClerkProvider } from "@clerk/clerk-react";
import Navbar from "@/components/Navbar";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!PUBLISHABLE_KEY) {
    console.warn("Missing Clerk Publishable Key");
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY!}>
      <html
        lang="en"
        className="h-full antialiased dark"
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col font-sans bg-black text-white">
          <Navbar />
          <main className="flex-grow pt-16">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
