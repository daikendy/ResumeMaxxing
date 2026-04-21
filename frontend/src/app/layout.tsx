'use client';

import "./globals.css";

import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import Navbar from "@/components/Navbar";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!PUBLISHABLE_KEY) {
    console.warn("Missing Clerk Publishable Key");
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY!}
      localization={{
        socialButtonsBlockButton: "Authorize via {{provider}}",
        dividerText: "OR_ESTABLISH_EMAIL_UPLINK",
        signIn: {
          start: {
            title: "ESTABLISH_UPLINK",
            subtitle: "Authorized session for ResumeMaxxing. By continuing, you agree to our Terms & Privacy Protocols."
          }
        },
        signUp: {
          start: {
            title: "INITIALIZE_OPERATOR",
            subtitle: "New identity creation sequence. By continuing, you agree to our Terms & Privacy Protocols."
          }
        },
        formFieldLabel__emailAddress: "USER_IDENTIFIER",
        formFieldLabel__password: "ACCESS_TOKEN",
      }}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#00f0ff",
          colorBackground: "#09090b", // zinc-950
          colorInputBackground: "#18181b", // zinc-900
          colorInputText: "#ffffff",
          borderRadius: "0px",
        },
        elements: {
          card: "border border-white/10 shadow-[0_0_50px_rgba(0,240,255,0.05)]",
          formButtonPrimary: "bg-cyan-accent text-black hover:bg-white uppercase tracking-tighter font-bold",
          footerActionLink: "text-cyan-accent hover:text-white",
        }
      }}
    >
      <html
        lang="en"
        className="h-full antialiased dark"
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col font-sans bg-black text-white">
          <Toaster position="bottom-right" theme="dark" richColors closeButton />
          <Navbar />
          <main className="flex-grow pt-16">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
