'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import TopActions from '@/components/TopActions';
import ProjectTags from '@/components/ProjectTags';
import ProjectCard from '@/components/ProjectCard';

type FlowKey =
  | 'analysis'   // 現状分析・課題整理
  | 'objective'  // 目的整理
  | 'concept'    // コンセプト策定
  | 'plan'       // 施策案作成
  | 'proposal'   // 提案書作成
  | 'empty';     // 空き枠（遷移なし）

type CardDef = {
  flow: FlowKey;
  title: string;
  desc: string;
  img?: string;
};

const PROJECT_ID = 'p-demo-001'; // ★DB接続後は実IDに置き換え

const CARDS: CardDef[] = [
  { flow: 'analysis',  title: '現状分析・課題整理', desc: '背景や現状を把握し、課題を明確化する',     img: '/card-analysis.png' },
  { flow: 'objective', title: '目的整理',           desc: '達成したい成果や方向性を定める',           img: '/card-goal.png' },
  { flow: 'concept',   title: 'コンセプト策定',     desc: '課題解決の基本方針と枠組みを設計する',       img: '/card-concept.png' },
  { flow: 'plan',      title: '施策案作成',         desc: '実行体制・数値目標・予算の素案を作る',       img: '/card-plan.png' },
  { flow: 'proposal',  title: '提案書作成',         desc: '説明・合意形成のための資料を準備する',       img: '/card-proposal.png' },
  { flow: 'empty',     title: '（空き枠）',         desc: 'あとで中身を足します' },
];

export default function ProjectPage() {
  const project = {
    title: '地方企業と都市部との連携施策',  //新規プロジェクトで入力したタイトルを反映
    members: ['伊藤 彩香', '木村 翔太'],  //選択したプロジェクトメンバーを反映
  };

  // 各フローの進捗（localStorage判定）
  const [progress, setProgress] = useState<Record<FlowKey, boolean>>({
    analysis: false,
    objective: false,
    concept: false,
    plan: false,
    proposal: false,
    empty: false,
  });

  useEffect(() => {
    const next: Record<FlowKey, boolean> = { ...progress };
    (['analysis', 'objective', 'concept', 'plan', 'proposal'] as FlowKey[]).forEach((f) => {
      try {
        const hasMsg = !!localStorage.getItem(`messages:${PROJECT_ID}:${f}`);
        const hasOrg = !!localStorage.getItem(`organizer:${PROJECT_ID}:${f}`);
        next[f] = hasMsg || hasOrg;
      } catch {
        next[f] = false;
      }
    });
    setProgress(next);
    // 初回のみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* ヘッダー / 上部アクション */}
        <Header />
        <TopActions />

        {/* タイトル＆タグ */}
        <h1 className="mt-10 text-3xl font-semibold">{project.title}</h1>
        <ProjectTags members={project.members} />

        {/* カード一覧 */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS.map((c) => {
            const hasProgress = progress[c.flow] && c.flow !== 'empty';
            const href =
              c.flow === 'empty'
                ? undefined
                : `/messages?projectId=${encodeURIComponent(PROJECT_ID)}&flow=${c.flow}`;

            return (
              <div key={c.flow} className="relative">
                {/* 進捗バッジ */}
                {hasProgress && (
                  <span className="absolute z-10 top-3 right-3 inline-flex items-center gap-1 rounded-full bg-sky-500/90 text-white text-xs px-2 py-0.5">
                    進捗あり
                  </span>
                )}
                {/* カード本体（ProjectCard は href / hasProgress を受け取れる拡張版を使用） */}
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