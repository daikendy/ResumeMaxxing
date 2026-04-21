import React from 'react';
import { SITE_CONFIG } from '@/lib/config';

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
  "name": SITE_CONFIG.name,
  "url": SITE_CONFIG.baseUrl,
  "logo": `${SITE_CONFIG.baseUrl}/logo.png`,
  "sameAs": [
    `https://twitter.com/${SITE_CONFIG.seo.social.twitter.replace('@', '')}`,
    `https://github.com/${SITE_CONFIG.seo.social.github}`
  ],
  "description": SITE_CONFIG.seo.description
});

export const getSoftwareAppSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": SITE_CONFIG.name,
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
