'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootEditorPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to a default job ID to enter the new Studio experience
    router.replace('/editor/1');
  }, [router]);

  return <div className="h-screen w-full bg-zinc-950"></div>;
}
