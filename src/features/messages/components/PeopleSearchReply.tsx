'use client';

import { useState, useCallback, useEffect, useRef } from "react";
import CandidateList, { Candidate } from "./CandidateList";

type NetworkNode = { id: string; label: string; kind?: string };
type NetworkEdge = { source: string; target: string; label?: string };
type NetworkGraph = { nodes: NetworkNode[]; edges: NetworkEdge[] };
type CoworkerProfile = {
  id: number;
  name: string;
  title?: string | null;
  department?: string | null;
  work_history: { period: string; text: string }[];
  project_history: { period: string; text: string }[];
};

export default function PeopleSearchReply({
  items,
  narrative,
}: {
  items: Candidate[];
  narrative?: string;
}) {
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showLarge, setShowLarge] = useState(false); // ← 拡大モーダル
  const [cvOpen, setCvOpen] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
  const [cv, setCv] = useState<CoworkerProfile | null>(null);
  const [cvErr, setCvErr] = useState<string | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "";

  const handleClose = useCallback(() => {
  setSelected(null);
  setDetail(null);
  setErrorText(null);
  }, []);

  useEffect(() => {
  if (!selected) return;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
  }, [selected, handleClose]);
useEffect(() => {
  if (!cvOpen) return;
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCvOpen(false);
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [cvOpen]);

  const handleSelect = useCallback(async (c: Candidate) => {
    setSelected(c);
    setDetail(null);
    setErrorText(null);

    setLoadingDetail(true);
    try {
      // API ベースURLを環境変数から読み込む
      const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "";
      const res = await fetch(`${apiBase}/detail/${c.id}`);

      if (!res.ok) {
        throw new Error(`詳細情報の取得に失敗しました (status ${res.status})`);
      }

      const data = await res.json();
      setDetail(data);

      if (!data?.gbiz_info) {
        setErrorText("gBizINFO情報は見つかりませんでした。");
      }
    } catch (e: any) {
      console.error(e);
      setDetail(null);
      setErrorText(e?.message ?? "詳細情報の取得に失敗しました。");
    } finally {
      setLoadingDetail(false);
    }
  }, []);
const handleNodeClick = useCallback(async (node: NetworkNode) => {
  if (!node.id?.startsWith("cw:")) return;
  const id = Number(node.id.split(":")[1] || "0");

  setCvOpen(true);
  setCvLoading(true);
  setCvErr(null);
  setCv(null);

  try {
    const r = await fetch(`${apiBase}/api/coworkers/${id}/profile`, { cache: "no-store" });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const data = (await r.json()) as CoworkerProfile;
    setCv(data);
  } catch {
    setCvErr("プロフィールの取得に失敗しました");
  } finally {
    setCvLoading(false);
  }
}, [apiBase]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {narrative && (
        <div className="mb-3 whitespace-pre-wrap text-sm leading-6 text-gray-800">
          {narrative}
        </div>
      )}

      {/* 候補リスト */}
      <CandidateList items={items} onSelect={handleSelect} />

      {selected && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm text-gray-500">
            選択中: <span className="font-medium">{selected.name}</span>
            {selected.company ? `（${selected.company}）` : "（会社名未登録）"}
          </div>
          <button
          onClick={handleClose}
          className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
          aria-label="詳細ウインドウを閉じる"
          >
          × 閉じる
          </button>
          </div>

          {/* 詳細表示 */}
          {loadingDetail ? (
            <div className="text-sm text-gray-500">詳細情報を取得中…</div>
          ) : detail ? (
            <div className="text-sm space-y-1">
              {detail.gbiz_info ? (
                <>
                  <div className="font-semibold">{detail.gbiz_info.name}</div>
                  <div>{detail.gbiz_info.location}</div>
                  <div>資本金: {detail.gbiz_info.capital}</div>
                  <div>従業員数: {detail.gbiz_info.employee_number}</div>
                  <div>設立: {detail.gbiz_info.founding_date}</div>
                  <div className="text-xs text-gray-500">
                    更新日: {detail.gbiz_info.update_date}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-400">
                  {errorText ?? "gBizINFO情報はまだ表示できません。"}
                </div>
              )}
              {/* ▼▼ ここが追加：ネットワーク図 ▼▼ */}
              <div className="mt-4 border-t pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-semibold">社内の名刺保有ネットワーク</div>
                  <button
                    onClick={() => setShowLarge(true)}
                    className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    拡大
                  </button>
                </div>
                {detail?.network?.nodes?.length ? (
                  <NetworkCanvas
                    graph={detail.network as NetworkGraph}
                    height={480}
                    onNodeClick={handleNodeClick}
                  />
                ) : (
                  <div className="text-sm text-gray-500">ネットワーク情報がありません</div>
                )}
              </div>
              {/* ▲▲ ここまで追加 ▲▲ */}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              {errorText ?? "詳細情報はまだ表示できません。"}
            </div>
          )}
        </div>
      )}

        {showLarge && detail?.network && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
        <div className="bg-white w-[min(960px,92vw)] rounded-2xl shadow-xl p-4">
        <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold">ネットワーク（拡大表示）</div>
        <button
          onClick={() => setShowLarge(false)}
          className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
          aria-label="拡大表示を閉じる"
        >
          × 閉じる
        </button>
      </div>
      {/* 70vh=画面の70%の高さで大きく表示 */}
      <NetworkCanvas
        graph={detail.network as NetworkGraph}
        height="70vh"
        onNodeClick={handleNodeClick}
      />
    </div>
  </div>
)}
{cvOpen && (
  <div
    className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center"
    onClick={() => setCvOpen(false)}
  >
    <div
      className="bg-white w-[min(960px,92vw)] max-h-[80vh] overflow-auto rounded-2xl shadow-xl p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="text-lg font-semibold">
          {cv?.name || "プロフィール"}
          {cv && (
            <span className="ml-2 text-sm text-gray-500">
              {cv.department ? `${cv.department} / ` : ""}{cv.title || ""}
            </span>
          )}
        </div>
        <button
          onClick={() => setCvOpen(false)}
          className="rounded-lg border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
        >
          × 閉じる
        </button>
      </div>

      {cvLoading ? (
        <div className="text-sm text-gray-500">読み込み中…</div>
      ) : cvErr ? (
        <div className="text-sm text-red-600">{cvErr}</div>
      ) : cv ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm leading-7">
          <div>
            <div className="font-semibold mb-2">経歴</div>
            <ul className="space-y-1">
              {cv.work_history.length ? (
                cv.work_history.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 text-gray-500 w-20">{h.period}</span>
                    <span>{h.text}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">経歴情報は未登録です</li>
              )}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">プロジェクト履歴</div>
            <ul className="space-y-1">
              {cv.project_history.length ? (
                cv.project_history.map((p, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 text-gray-500 w-20">{p.period}</span>
                    <span>{p.text}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">プロジェクト履歴は未登録です</li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400">データがありません</div>
      )}
    </div>
  </div>
)}
    </div>
  );
}

function NetworkCanvas({
  graph,
  height = 480,
  dot = 14,
  centerDot = 20,
  font = 16,
  radiusRatio = 0.33,
  labelLimit = 12,
  onNodeClick,
}: {
  graph: NetworkGraph;
  height?: number | string;
  dot?: number;
  centerDot?: number;
  font?: number;
  radiusRatio?: number;
  labelLimit?: number;
  onNodeClick?: (node: NetworkNode) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const layoutRef = useRef<{ id: string; x: number; y: number; r: number }[]>([]);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    // 見た目サイズ（CSS）→ 実ピクセル（高DPI対応）
    const W = el.clientWidth || 640;
    const H = el.clientHeight || 360;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    el.width = Math.floor(W * ratio);
    el.height = Math.floor(H * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // 中心ノード取得
    const center =
      graph.nodes.find((n) => n.kind === "中心") ?? graph.nodes[0] ?? null;
    if (!center) return;

    // 配置パラメータ：線を短くするため半径を"比率"で決定
    const centerPos = { x: W / 2, y: H / 2 };
    const others = graph.nodes.filter((n) => n.id !== center.id);
    const R = Math.min(W, H) * radiusRatio; // ← ここを小さくすると線が短くなる

    const pos: Record<string, { x: number; y: number }> = {
      [center.id]: centerPos,
    };
    others.forEach((n, i) => {
      const ang = (i / Math.max(1, others.length)) * Math.PI * 2;
      pos[n.id] = {
        x: centerPos.x + R * Math.cos(ang),
        y: centerPos.y + R * Math.sin(ang),
      };
    });

    layoutRef.current = Object.entries(pos).map(([id, p]) => ({
      id,
      x: p.x,
      y: p.y,
      r: id === center.id ? centerDot : dot,
    }));

    // エッジ（少し太め）
    ctx.strokeStyle = "#cbd5e1"; // slate-300
    ctx.lineWidth = 1.8;
    graph.edges.forEach((e) => {
      const a = pos[e.source];
      const b = pos[e.target];
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    // ノード描画（○を大きく / 文字を大きく）
    const drawNode = (
      p: { x: number; y: number },
      label: string,
      isCenter?: boolean
    ) => {
      ctx.beginPath();
      ctx.fillStyle = isCenter ? "#93c5fd" : "#e5e7eb"; // blue-300 / gray-200
      ctx.arc(p.x, p.y, isCenter ? centerDot : dot, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#111827";
      ctx.font = `${font}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const short =
        label.length > labelLimit ? label.slice(0, labelLimit) + "…" : label;
      ctx.fillText(short, p.x, p.y - (isCenter ? centerDot + 8 : dot + 6));
    };

    drawNode(centerPos, center.label, true);
    others.forEach((n) => drawNode(pos[n.id], n.label, false));
  }, [graph, dot, centerDot, font, radiusRatio, labelLimit]);

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNodeClick) return;
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hit = layoutRef.current.find(p => Math.hypot(x - p.x, y - p.y) <= p.r + 4);
    if (!hit) return;
    const node = graph.nodes.find(n => n.id === hit.id);
    if (node) onNodeClick(node);
  };
  return (
    <div className="w-full">
    <canvas
      ref={ref}
      onClick={onCanvasClick}
      className="w-full block rounded-md bg-white cursor-pointer"
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    />
      <div className="mt-1 text-[10px] text-gray-400">
        ※簡易図。ラベルは先頭{labelLimit}文字で省略表示
      </div>
    </div>
  );
}

