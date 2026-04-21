/**
 * Global Site Configuration
 * Use this file to define values used across the app to avoid hardcoding.
 */

export const SITE_CONFIG = {
  name: "ResumeMaxxing",
  shortName: "R",
  version: "1.0.0",
  domain: "resumemaxxing.com",
  baseUrl: process.env.NODE_ENV === 'production' 
    ? "https://resumemaxxing.com" 
    : "http://localhost:3000",
  
  seo: {
    defaultTitle: "ResumeMaxxing | ATS-Friendly AI Resume Builder for Tech",
    titleTemplate: "%s | ResumeMaxxing",
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
      twitter: "@resumemaxxing",
      github: "resumemaxxing"
    },
    ogImage: "/og-image.png"
  },

  company: {
    email: "support@resumemaxxing.com",
    address: "Global / Remote",
  },

  // Capacitor / Mobile settings
  mobile: {
    appId: "com.resumemaxxing.app",
    appName: "ResumeMaxxing",
  }
};
