'use client';
import { useSearchParams } from 'next/navigation';
import MessagesApp from '@/features/messages/MessagesApp';

export default function MessagesPage() {
  const sp = useSearchParams();
  const projectId = sp.get('projectId') || undefined;
  const flow = (sp.get('flow') || 'analysis') as 'analysis' | 'objective' | 'concept' | 'plan' | 'proposal';

  return <MessagesApp projectId={projectId} initialFlow={flow} />;
}