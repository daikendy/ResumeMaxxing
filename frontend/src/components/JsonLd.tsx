import React from 'react';

interface JsonLdProps {
  data: any;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Predefined Schema Generators
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ResumeMaxxing",
  "url": "https://resumemaxxing.com",
  "logo": "https://resumemaxxing.com/logo.png",
  "sameAs": [
    "https://twitter.com/resumemaxxing",
    "https://github.com/resumemaxxing"
  ],
  "description": "The AI Resume Architect for Software Engineers and Tech Professionals."
});

export const getSoftwareAppSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ResumeMaxxing",
  "operatingSystem": "Web",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "1240"
  },
  "featureList": [
    "AI-Powered Resume Tailoring",
    "ATS-Optimized Single Column Templates",
    "Real-time Editor with Zoom",
    "Master Profile Vault",
    "PDF and LaTeX Exports"
  ]
});
