import React from 'react';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { LucideCalendar, LucideUser, LucideArrowLeft, LucideTerminal } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/lib/config';

// MDX Components to match the industrial theme
const components = {
  h1: (props: any) => <h1 className="text-3xl md:text-5xl font-heading text-white uppercase tracking-tighter mb-8 mt-12" {...props} />,
  h2: (props: any) => <h2 className="text-2xl md:text-3xl font-heading text-white uppercase tracking-tighter mb-6 mt-12" {...props} />,
  p: (props: any) => <p className="text-xs md:text-sm font-mono text-white/70 tracking-widest leading-relaxed mb-6" {...props} />,
  ul: (props: any) => <ul className="list-none space-y-4 mb-8" {...props} />,
  li: (props: any) => (
    <li className="flex items-start gap-4 text-xs md:text-sm font-mono text-white/50 tracking-widest leading-relaxed" {...props}>
      <span className="w-1.5 h-1.5 bg-cyan-accent mt-2 shrink-0"></span>
      {props.children}
    </li>
  ),
  strong: (props: any) => <strong className="text-cyan-accent font-black italic" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-2 border-cyan-accent pl-8 py-4 bg-white/5 my-12" {...props} />
  ),
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | Engineering Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-black industrial-grid selection:bg-cyan-accent selection:text-black font-sans">
      
      {/* ARTICLE HEADER */}
      <header className="pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] uppercase font-mono text-cyan-accent/60 hover:text-cyan-accent transition-colors mb-12">
            <LucideArrowLeft className="w-3 h-3" /> System_Return_To_List
          </Link>
          
          <div className="flex items-center gap-4 text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] mb-8">
             <span className="flex items-center gap-2"><LucideCalendar className="w-3 h-3" /> {post.date}</span>
             <span className="flex items-center gap-2"><LucideUser className="w-3 h-3" /> {post.author}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-heading text-white tracking-tighter uppercase mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-[12px] font-mono text-white/50 uppercase tracking-[0.2em] leading-relaxed border-l border-white/10 pl-6 italic">
            {post.description}
          </p>
        </div>
      </header>

      {/* ARTICLE CONTENT */}
      <main className="py-20 px-6">
        <article className="max-w-3xl mx-auto">
          <MDXRemote source={post.content} components={components} />
        </article>
      </main>

      {/* ARTICLE FOOTER (Newsletter Bridge) */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto glass-panel p-12 text-center space-y-8">
            <LucideTerminal className="w-12 h-12 text-cyan-accent mx-auto" />
            <h3 className="text-2xl font-heading text-white uppercase tracking-tighter">Ready to architect your success?</h3>
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest leading-relaxed">
              Don't apply with a broken layout. Use the system engineered for technical perfection.
            </p>
            <Link href="/" className="inline-block bg-cyan-accent text-black px-12 py-4 font-heading font-bold uppercase tracking-widest hover:bg-white transition-colors">
              Initialize V1 Console
            </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
