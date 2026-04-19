import EditorClient from './EditorClient';

export function generateStaticParams() {
  // Required for Next.js static export. Provide dummy IDs or fetch them from backend.
  return [{ jobId: 'test-job' }];
}

export default async function EditorPage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = await params;
  return <EditorClient jobId={resolvedParams.jobId} />;
}
