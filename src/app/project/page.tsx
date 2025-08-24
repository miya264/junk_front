'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import TopActions from '@/components/TopActions';
import ProjectTags from '@/components/ProjectTags';
import ProjectCard from '@/components/ProjectCard';
import { ApiService, type Project } from '@/services';

type FlowKey =
  | 'analysis'
  | 'objective'
  | 'concept'
  | 'plan'
  | 'proposal'
  | 'empty';

type CardDef = {
  flow: FlowKey;
  title: string;
  desc: string;
  img?: string;
};

const CARDS: CardDef[] = [
  { flow: 'analysis',  title: '現状分析・課題整理', desc: '背景や現状を把握し、課題を明確化する',     img: '/card-analysis.png' },
  { flow: 'objective', title: '目的整理',           desc: '達成したい成果や方向性を定める',           img: '/card-goal.png' },
  { flow: 'concept',   title: 'コンセプト策定',     desc: '課題解決の基本方針と枠組みを設計する',       img: '/card-concept.png' },
  { flow: 'plan',      title: '施策案作成',         desc: '実行体制・数値目標・予算の素案を作る',       img: '/card-plan.png' },
  { flow: 'proposal',  title: '提案書作成',         desc: '説明・合意形成のための資料を準備する',       img: '/card-proposal.png' },
];

// ✅ 内側に分離：ここで useSearchParams を使う
function ProjectPageInner() {
  const searchParams = useSearchParams();
  // クエリ名の不一致に対応（どちらでもOKにする）
  const projectId = searchParams.get('project_id') || searchParams.get('projectId');

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState<Record<FlowKey, boolean>>({
    analysis: false,
    objective: false,
    concept: false,
    plan: false,
    proposal: false,
    empty: false,
  });

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError('プロジェクトIDが指定されていません');
        setLoading(false);
        return;
      }
      try {
        const projectData = await ApiService.project.getProject(projectId);
        setProject(projectData);
        setError(null);
      } catch (err) {
        console.error('Failed to load project:', err);
        setError('プロジェクトの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const next: Record<FlowKey, boolean> = {
      analysis: false,
      objective: false,
      concept: false,
      plan: false,
      proposal: false,
      empty: false,
    };
    (['analysis', 'objective', 'concept', 'plan', 'proposal'] as FlowKey[]).forEach((f) => {
      try {
        const hasMsg = !!localStorage.getItem(`messages:${projectId}:${f}`);
        const hasOrg = !!localStorage.getItem(`organizer:${projectId}:${f}`);
        next[f] = hasMsg || hasOrg;
      } catch {
        next[f] = false;
      }
    });
    setProgress((prev) => {
      const changed = Object.keys(next).some((k) => (next as any)[k] !== (prev as any)[k]);
      return changed ? next : prev;
    });
  }, [projectId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <Header />
          <div className="mt-10 text-center">
            <div className="animate-pulse">プロジェクト読み込み中...</div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <Header />
          <div className="mt-10 text-center">
            <div className="text-red-600">{error || 'プロジェクトが見つかりません'}</div>
            <Link href="/project_start" className="mt-4 inline-block text-blue-600 hover:underline">
              プロジェクト一覧に戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Header />
        <TopActions />

        <h1 className="mt-10 text-3xl font-semibold">{project.name}</h1>
        <ProjectTags members={project.members.map(m => m.name)} />

        <div className="mt-4 text-gray-600">
          <p>オーナー: {project.owner_name}</p>
          <p>メンバー数: {project.members.length}人</p>
          {project.description && <p className="mt-2">{project.description}</p>}
        </div>

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS.map((c) => {
            const hasProgress = progress[c.flow] && c.flow !== 'empty';
            const href = (c.flow === 'empty' || !projectId)
              ? undefined
              : `/messages?projectId=${encodeURIComponent(projectId)}&flow=${c.flow}`;

            return (
              <div key={c.flow} className="relative">
                {hasProgress && (
                  <span className="absolute z-10 top-3 right-3 inline-flex items-center gap-1 rounded-full bg-sky-500/90 text-white text-xs px-2 py-0.5">
                    進捗あり
                  </span>
                )}
                <ProjectCard
                  title={c.title}
                  desc={c.desc}
                  img={c.img}
                  href={href}
                  hasProgress={hasProgress}
                />
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

// ✅ ここがページのエクスポート：Suspense で包む
export default function ProjectPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading project…</div>}>
      <ProjectPageInner />
    </Suspense>
  );
}
