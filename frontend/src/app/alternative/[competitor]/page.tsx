import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SITE_CONFIG } from '@/lib/config';
import { 
  LucideCheck, 
  LucideX, 
  LucideShieldCheck, 
  LucideZap, 
  LucideTarget, 
  LucideCpu,
  LucideArrowRight,
  LucideInfo
} from 'lucide-react';

interface CompetitorData {
  name: string;
  slug: string;
  description: string;
  keywords: string[];
  comparisonPoints: {
    feature: string;
    competitor: string | boolean;
    us: string | boolean;
    highlight?: boolean;
  }[];
  heroTitle: string;
  heroSub: string;
}

const COMPETITORS: Record<string, CompetitorData> = {
  teal: {
    name: "Teal",
    slug: "teal",
    description: `The lightweight, AI-native alternative to Teal. Engineered for software engineers who need speed and precision over project management bloat.`,
    keywords: ["Teal alternative for engineers", "AI resume builder vs Teal", "developer resume builder"],
    heroTitle: "Faster. Lighter. Tech-First.",
    heroSub: `Teal is a great CRM for jobs. ${SITE_CONFIG.name} is a high-performance architect for resumes. Switch to the tool engineered strictly for the hunt.`,
    comparisonPoints: [
      { feature: "AI Accuracy for Tech Roles", competitor: "Generalist", us: "Tech-Optimized", highlight: true },
      { feature: "Speed to Export", competitor: "Medium", us: "Instant", highlight: true },
      { feature: "Project Management Bloat", competitor: "High", us: "Zero", highlight: false },
      { feature: "ATS-Verified Templates", competitor: true, us: true },
      { feature: "Deep AI Tailoring", competitor: "Basic", us: "Deep Search" }
    ]
  },
  novoresume: {
    name: "Novoresume",
    slug: "novoresume",
    description: `The ATS-first alternative to Novoresume. Our single-column, mathematically engineered templates pass the parsers that Novoresume's multi-column designs break.`,
    keywords: ["Novoresume alternative", "ATS friendly resume vs Novoresume", "single column resume builder"],
    heroTitle: "ATS Precision vs. Visual Bloat.",
    heroSub: `Multi-column templates look great to humans but break most parsers. We engineered ${SITE_CONFIG.name} to pass systems 100% of the time. Zero compromise.`,
    comparisonPoints: [
      { feature: "ATS Parsing Accuracy", competitor: "Variable (Columns)", us: "100% Precision", highlight: true },
      { feature: "Software Engineer Focus", competitor: "General", us: "Hyper-Niche", highlight: true },
      { feature: "Single Column (Standard)", competitor: false, us: true },
      { feature: "AI Content Generation", competitor: "Standard", us: "Agentic" },
      { feature: "Markdown / LaTeX Support", competitor: false, us: true }
    ]
  },
  zety: {
    name: "Zety",
    slug: "zety",
    description: `The niche tech alternative to Zety. Zety is for everyone; ${SITE_CONFIG.name} is engineered strictly for software engineers and IT professionals.`,
    keywords: ["Zety alternative for software engineers", "tech resume maker vs zety", "best developer resume builder"],
    heroTitle: "Engineered for Tech. Not Everyone.",
    heroSub: `Zety builds resumes for 1,000 industries. We build for one: The Tech Industry. Better keywords, better parsers, better results for developers.`,
    comparisonPoints: [
      { feature: "Industry Focus", competitor: "Everyone", us: "Tech Professionals Only", highlight: true },
      { feature: "Technical Keyword Logic", competitor: "Standard", us: "AI Powered Deep-Link", highlight: true },
      { feature: "ATS-First Integrity", competitor: true, us: true },
      { feature: "Developer UX", competitor: "Simple", us: "Industrial Dashboard", highlight: true },
      { feature: "No Credit Card (V1 Tier)", competitor: true, us: true }
    ]
  }
};

export function generateStaticParams() {
  return [
    { competitor: 'teal' },
    { competitor: 'novoresume' },
    { competitor: 'zety' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ competitor: string }> }): Promise<Metadata> {
  const { competitor } = await params;
  const data = COMPETITORS[competitor.toLowerCase()];
  if (!data) return { title: "Alternative Not Found" };

  return {
    title: `Best ${data.name} Alternative for Software Engineers | ${SITE_CONFIG.name}`,
    description: data.description,
    keywords: data.keywords,
  };
}

export default async function AlternativePage({ params }: { params: Promise<{ competitor: string }> }) {
  const { competitor } = await params;
  const data = COMPETITORS[competitor.toLowerCase()];
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans pb-32">
      
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-accent/10 border border-cyan-accent/20 rounded-full mb-8">
            <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-accent">{data.name} Alternative</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-heading text-white tracking-tighter uppercase mb-6 leading-tight">
            {data.heroTitle}
          </h1>

          <p className="max-w-2xl mx-auto text-sm md:text-md font-mono text-white/40 uppercase tracking-widest leading-relaxed mb-12">
            {data.heroSub}
          </p>

          <div className="flex justify-center gap-6">
            <Link href="/">
              <Button className="h-14 px-10 bg-cyan-accent text-black hover:bg-white uppercase font-heading font-bold tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                Try {SITE_CONFIG.name} Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel overflow-hidden border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-6 text-[10px] uppercase tracking-widest text-white/40 font-bold">Feature</th>
                  <th className="p-6 text-[10px] uppercase tracking-widest text-white/40 font-bold">{data.name}</th>
                  <th className="p-6 text-[10px] uppercase tracking-widest text-cyan-accent font-black italic">{SITE_CONFIG.name}</th>
                </tr>
              </thead>
              <tbody>
                {data.comparisonPoints.map((point, i) => (
                  <tr key={i} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${point.highlight ? 'bg-cyan-accent/[0.02]' : ''}`}>
                    <td className="p-6">
                      <span className="text-xs font-mono text-white/80 uppercase">{point.feature}</span>
                    </td>
                    <td className="p-6">
                      {typeof point.competitor === 'boolean' ? (
                        point.competitor ? <LucideCheck className="w-4 h-4 text-white/20" /> : <LucideX className="w-4 h-4 text-red-900/40" />
                      ) : (
                        <span className="text-[10px] font-mono text-white/20 uppercase">{point.competitor}</span>
                      )}
                    </td>
                    <td className="p-6">
                      {typeof point.us === 'boolean' ? (
                        point.us ? <LucideCheck className="w-5 h-5 text-cyan-accent" /> : <LucideX className="w-5 h-5 text-red-500" />
                      ) : (
                        <span className="text-[10px] font-mono text-cyan-accent font-bold uppercase">{point.us}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-sm">
             <LucideInfo className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
             <p className="text-[9px] font-mono text-white/30 uppercase leading-relaxed uppercase tracking-tighter">
               Legal Disclaimer: {data.name} is a registered trademark of its respective holders. Use of the name is for nominative comparison purposes only and does not imply affiliation or endorsement. Data is based on public feature availability and {SITE_CONFIG.name} internal testing as of {new Date().toLocaleString('en-us', { month: 'long', year: 'numeric' })}.
             </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-12">
          <h2 className="text-3xl font-heading text-white tracking-tighter uppercase">
            Stop Browsing. <span className="text-cyan-accent">Start Architecting.</span>
          </h2>
          <p className="text-xs font-mono text-white/40 uppercase tracking-widest leading-relaxed">
            Don't let a generic builder sink your application. Join thousands of Software Engineers who use {SITE_CONFIG.name} to bypass the noise.
          </p>
          <Link href="/">
            <Button variant="outline" className="h-16 px-16 border-cyan-accent text-cyan-accent hover:bg-cyan-accent hover:text-black uppercase font-heading font-bold tracking-widest text-sm transition-all">
              Initialize V1 Console
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
