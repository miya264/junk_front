'use client';
import { useSearchParams } from 'next/navigation';
import MessagesApp from '@/features/messages/MessagesApp';
import { Suspense } from 'react';

function MessagesContent() {
  const sp = useSearchParams();
  const projectId = sp.get('projectId') || undefined;
  const flow = (sp.get('flow') || 'analysis') as 'analysis' | 'objective' | 'concept' | 'plan' | 'proposal';

  return <MessagesApp projectId={projectId} initialFlow={flow} />;
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}