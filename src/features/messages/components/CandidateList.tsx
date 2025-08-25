'use client';
import React from "react";

export type Candidate = {
  id: number;
  name: string;
  company?: string;
  department?: string;
  title?: string;
  skills?: string;
  score?: number;
  avatar_url?: string | null;
};

export default function CandidateList({
  items,
  onSelect,
}: {
  items: Candidate[];
  onSelect?: (c: Candidate) => void;
}) {
  if (!items?.length) {
    return <div className="text-sm text-gray-500">該当者はいませんでした。</div>;
  }

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>, p: Candidate) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(p);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((p) => (
        <div
          key={p.id}
          role="button"
          tabIndex={0}
          className="rounded-xl border p-3 transition hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={() => onSelect?.(p)}
          onKeyDown={(e) => handleKey(e, p)}
        >
          <div className="font-semibold">{p.name}</div>

          <div className="text-xs text-gray-500">
            {/* 会社名 / 部署 / 役職 を1行で */}
            {[p.company, p.department, p.title].filter(Boolean).join(" / ")}
          </div>

          {p.skills && (
            <div className="mt-1 text-xs line-clamp-2">{p.skills}</div>
          )}
        </div>
      ))}
    </div>
  );
}
