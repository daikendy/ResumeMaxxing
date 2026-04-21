import { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import JsonLd, { getOrganizationSchema, getSoftwareAppSchema } from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.seo.defaultTitle,
    template: SITE_CONFIG.seo.titleTemplate,
  },
  description: SITE_CONFIG.seo.description,
  keywords: SITE_CONFIG.seo.keywords,
  authors: [{ name: `${SITE_CONFIG.name} Team` }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_CONFIG.name,
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.baseUrl,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.seo.defaultTitle,
    description: SITE_CONFIG.seo.description,
    images: [
      {
        url: SITE_CONFIG.seo.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} Social Preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.seo.defaultTitle,
    description: SITE_CONFIG.seo.description,
    images: [SITE_CONFIG.seo.ogImage],
    creator: SITE_CONFIG.seo.social.twitter,
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
