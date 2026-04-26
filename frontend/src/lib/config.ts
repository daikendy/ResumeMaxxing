/**
 * Global Site Configuration
 * Use this file to define values used across the app to avoid hardcoding.
 */

export const SITE_CONFIG = {
  name: "Resumaxxing",
  shortName: "RX",
  version: "1.1.0",
  domain: "resumaxxing.tech",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' 
    ? "https://resumaxxing.tech" 
    : "http://localhost:3000"),
  
  seo: {
    defaultTitle: "Resumaxxing | ATS-Friendly AI Resume Builder for Tech",
    titleTemplate: "%s | Resumaxxing",
    description: "The AI Resume Architect engineered for Software Engineers and IT Professionals. Generate ATS-optimized, single-column resumes that pass every parser.",
    keywords: [
      "ATS-friendly engineering resume builder",
      "Tech resume AI",
      "Developer resume maker",
      "Software Engineer Resume",
      "Tailored Tech Resume",
      "ATS Verified Resume"
    ],
    social: {
      twitter: "@resumaxxing",
      github: "resumaxxing"
    },
    ogImage: "/og-image.png"
  },

  company: {
    email: "support@resumaxxing.tech",
    address: "Global / Remote",
  },

  // Capacitor / Mobile settings
  mobile: {
    appId: "com.resumaxxing.app",
    appName: "Resumaxxing",
    downloads: {
      android: "/downloads/app-release.apk", // Centralized for easy updates
      ios: "Add to Home Screen",
      version: "1.1.0"
    }
  }
};
