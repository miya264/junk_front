'use client';

import React, { useEffect, useState } from 'react';
import type { FlowKey } from '@/types/flow';  // ★ 共通型
import { ApiService, type ProjectStepSection } from '@/services';

const FLOW_GUIDE: Record<FlowKey, { title: string; prompts: [string, string, string]; sectionKeys: [string, string, string] }> = {
  analysis: {
    title: '現状分析・課題整理：まず「現状」「根本原因」「優先度」を言語化しましょう。',
    prompts: [
      '課題と裏付け（定量・定性）を記入してください',
      '課題の背景にある構造（制度・市場など）を簡単に評価してください',
      '解決すべき課題の優先度と理由を整理しましょう',
    ],
    sectionKeys: ['problem', 'background', 'priority'],
  },
  objective: {
    title: '目的整理：達成したい状態と評価指標（KPI）を定めます。',
    prompts: [
      '最終的に達成したいゴールを具体的に記載してください',
      'KPI・目標値（いつまでに・どれだけ）を記入してください',
      '前提条件・制約（予算、人員、期間など）を整理しましょう',
    ],
    sectionKeys: ['goal', 'kpi', 'constraints'],
  },
  concept: {
    title: 'コンセプト策定：基本方針と解決アプローチを1枚で説明できるようにします。',
    prompts: [
      '基本方針（どんな価値を誰に、どう届けるか）を記入してください',
      '方針の根拠・示唆（調査、事例、専門家意見など）を書いてください',
      '主要リスクと打ち手（代替案、実験設計）を整理しましょう',
    ],
    sectionKeys: ['policy', 'rationale', 'risks'],
  },
  plan: {
    title: '施策案作成：実行体制・ロードマップ・概算コストまで見通します。',
    prompts: [
      '主な施策（3〜5個）の概要と狙いを整理してください',
      '体制・役割分担・スケジュールを記入してください',
      '概算コスト・効果見込み（根拠も）を書いてください',
    ],
    sectionKeys: ['initiatives', 'schedule', 'cost'],
  },
  proposal: {
    title: '提案書作成：意思決定者に伝わるストーリーでまとめます。',
    prompts: [
      '提案のサマリー（背景→課題→解決→効果→体制）を書いてください',
      '意思決定者の関心（費用対効果、リスク、責任分担）を整理してください',
      '次のアクション（承認プロセス、関係者説明、PoC準備など）を記入してください',
    ],
    sectionKeys: ['summary', 'concerns', 'next_steps'],
  },
};

export default function ContentOrganizer({
  projectId,
  flow,
  onSaved,
}: {
  projectId?: string;
  flow: FlowKey;
  onSaved?: () => void;
}) {
  const storageKey = `organizer:${projectId ?? 'no-project'}:${flow}`;
  const [boxes, setBoxes] = useState<string[]>(['', '', '']);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // データを読み込み（ローカルストレージ → API → ローカルストレージのフォールバック）
  useEffect(() => {
    const loadData = async () => {
      try {
        // プロジェクトIDがある場合はAPIから取得を試行
        if (projectId) {
          try {
            const sections = await ApiService.project.getProjectStepSections(projectId, flow);
            if (sections.length > 0) {
              const contentArray = sections.slice(0, 3).map(s => s.content || '');
              while (contentArray.length < 3) contentArray.push('');
              setBoxes(contentArray);
              // APIから取得できた場合はローカルストレージにも保存
              localStorage.setItem(storageKey, JSON.stringify(contentArray));
              return;
            }
          } catch (apiError) {
            console.warn('Failed to load from API, falling back to localStorage:', apiError);
          }
        }

        // ローカルストレージから読み込み（フォールバック）
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length === 3) {
            setBoxes([arr[0] ?? '', arr[1] ?? '', arr[2] ?? '']);
          } else {
            setBoxes(['', '', '']);
          }
        } else {
          setBoxes(['', '', '']);
        }
      } catch {
        setBoxes(['', '', '']);
      }
    };

    loadData();
  }, [storageKey, projectId, flow]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // ローカルストレージに保存
      localStorage.setItem(storageKey, JSON.stringify(boxes));
      
      // プロジェクトIDがある場合はAPIにも保存
      if (projectId) {
        console.log('ContentOrganizer: Saving to database', {
          projectId,
          flow,
          sectionsCount: boxes.length,
          hasContent: boxes.some(box => box.trim())
        });
        
        const guide = FLOW_GUIDE[flow];
        const sections: ProjectStepSection[] = boxes.map((content, index) => ({
          section_key: guide.sectionKeys[index],
          content: content.trim(),
          label: guide.prompts[index],
        }));

        console.log('ContentOrganizer: Request payload', {
          project_id: projectId,
          step_key: flow,
          sections
        });

        await ApiService.project.saveProjectStepSections({
          project_id: projectId,
          step_key: flow,
          sections,
        });
      } else {
        console.log('ContentOrganizer: No projectId, saving only to localStorage');
      }

      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 1400);
    } catch (err) {
      console.error('Save failed:', err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      
      let errorMessage = '保存に失敗しました。';
      if (err instanceof Error) {
        errorMessage += ` エラー: ${err.message}`;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const guide = FLOW_GUIDE[flow];

  return (
    <div className="w-[360px] min-w-[360px] h-full bg-white border-l border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="text-xs text-gray-500">内容整理</div>
        <div className="mt-1 text-[13px] leading-snug text-gray-800">{guide.title}</div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {guide.prompts.map((label, i) => (
          <div key={i} className="space-y-2">
            <div className="text-xs text-gray-500">{label}</div>
            <textarea
              className="w-full h-28 resize-none rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300 px-2 py-1 text-sm"
              value={boxes[i]}
              onChange={(e) => {
                const next = [...boxes];
                next[i] = e.target.value;
                setBoxes(next);
              }}
              placeholder="ここに入力してください"
            />
          </div>
        ))}
      </div>

      <div className="p-3 border-t space-y-2">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full rounded-md bg-slate-700 text-white py-2 text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '保存'}
        </button>
        
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
            {error}
          </div>
        )}
      </div>

      {saved && (
        <div className="absolute right-[380px] top-6 rounded-md bg-green-100 shadow px-4 py-2 text-sm text-green-800 border border-green-200">
          {projectId ? 'データベースに保存しました' : 'ローカルに保存しました'}
        </div>
      )}
    </div>
  );
}