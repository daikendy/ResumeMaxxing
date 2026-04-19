import EditorClient from './EditorClient';

export function generateStaticParams() {
  return [
    { jobId: '1' },
    { jobId: '123' },
    { jobId: 'test-job' }
  ];
}

export default async function EditorPage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = await params;
  return <EditorClient jobId={resolvedParams.jobId} />;
}
