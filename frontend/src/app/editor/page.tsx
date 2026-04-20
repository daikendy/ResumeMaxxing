'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EditorClient from './EditorClient';
import { LucideCircleDashed } from 'lucide-react';

/**
 * Loading state for the Editor during SearchParam extraction
 */
function EditorLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono p-6">
      <div className="text-cyan-accent animate-pulse tracking-widest flex flex-col items-center gap-4 text-center">
        <LucideCircleDashed className="w-8 h-8 animate-spin" />
        <span className="text-sm uppercase">Synchronizing Editor State...</span>
      </div>
    </div>
  );
}

/**
 * Search Parameter Wrapper
 * Decouples the jobId from the URL path to allow for static 'output: export' builds.
 */
function EditorSearchParamsWrapper() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || '1'; // Default to 1 if not provided

  return <EditorClient jobId={jobId} />;
}

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorLoader />}>
      <EditorSearchParamsWrapper />
    </Suspense>
  );
}
