import { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import JsonLd, { getOrganizationSchema, getSoftwareAppSchema } from "@/components/JsonLd";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "ResumeMaxxing | ATS-Friendly AI Resume Builder for Tech",
    template: "%s | ResumeMaxxing",
  },
  description: "The AI Resume Architect engineered for Software Engineers and IT Professionals. Generate ATS-optimized, single-column resumes that pass every parser.",
  keywords: [
    "ATS-friendly engineering resume builder",
    "Tech resume AI",
    "Developer resume maker",
    "Software Engineer Resume",
    "Tailored Tech Resume",
    "ATS Verified Resume"
  ],
  authors: [{ name: "ResumeMaxxing Team" }],
  openGraph: {
// ... existing og config ...
    type: "website",
    locale: "en_US",
    url: "https://resumemaxxing.com",
    siteName: "ResumeMaxxing",
    title: "ResumeMaxxing | AI Resume Architect for Tech",
    description: "Engineered for engineers. Stop guessing, start winning interviews at top tech firms.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ResumeMaxxing Social Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeMaxxing | AI Resume Architect for Tech",
    description: "The definitive AI resume builder for the tech industry.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
      suppressHydrationWarning
    >
      <head>
        <JsonLd data={getOrganizationSchema()} />
        <JsonLd data={getSoftwareAppSchema()} />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-black text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
