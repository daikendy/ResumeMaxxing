import React from 'react';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { LucideTerminal, LucideArrowRight, LucideCalendar, LucideUser } from 'lucide-react';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/lib/config';

export const metadata = {
  title: 'Engineering Blog',
  description: 'Technical insights on ATS optimization, AI resume tailoring, and tech careers.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans">
      
      {/* HEADER */}
      <header className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-accent/10 border border-cyan-accent/20 rounded-full mb-8">
            <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-accent">Internal_Documentation</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-heading text-white tracking-tighter uppercase mb-6 leading-tight">
            Engineering <span className="text-cyan-accent">Blog</span>
          </h1>
          <p className="max-w-xl text-xs md:text-sm font-mono text-white/40 uppercase tracking-widest leading-relaxed">
            Technical memos on architecting successful careers in the modern tech landscape.
          </p>
        </div>
      </header>

      {/* FEED */}
      <main className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-12">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block glass-panel p-8 border-white/5 hover:border-cyan-accent/40 transition-all duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4 flex-grow">
                  <div className="flex items-center gap-4 text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2"><LucideCalendar className="w-3 h-3" /> {post.date}</span>
                    <span className="flex items-center gap-2"><LucideUser className="w-3 h-3" /> {post.author}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading text-white group-hover:text-cyan-accent transition-colors tracking-tighter uppercase">
                    {post.title}
                  </h2>
                  <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest leading-relaxed line-clamp-2 max-w-2xl text-justify">
                    {post.description}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/5 flex items-center justify-center group-hover:bg-cyan-accent group-hover:text-black transition-all">
                  <LucideArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-20 bg-white/5 border border-white/10 p-12">
              <LucideTerminal className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-xs font-mono text-white/20 uppercase tracking-widest">No documentation found in the current environment.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
