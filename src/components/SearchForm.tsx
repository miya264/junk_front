'use client';
import { useMemo, useState } from 'react';

export type Row = { id: string; date: string; title: string; owner: string; bureau: string };

export default function SearchForm({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [field, setField] = useState('');

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const inQ = q ? [r.title, r.owner, r.bureau].join(' ').includes(q) : true;
      const inField = field ? r.bureau.includes(field) : true;
      const d = r.date.replace(/\//g, '');
      const f = from ? from.replace(/\//g, '') : '000000';
      const t = to ? to.replace(/\//g, '') : '999999';
      return inQ && inField && d >= f && d <= t;
    });
  }, [q, from, to, field, rows]);

  return (
    <>
      {/* 検索ボックス */}
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex items-center rounded-full bg-gray-200/70 px-4 py-3">
          <input className="flex-1 bg-transparent outline-none text-gray-700"
            placeholder="キーワードや人物を入力してください" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {/* 条件：期間 + 分野 */}
      <div className="max-w-3xl mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">検索期間（From）</label>
            <input className="w-full rounded-lg border px-3 py-2" placeholder="YYYY/MM"
              value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">検索期間（To）</label>
            <input className="w-full rounded-lg border px-3 py-2" placeholder="YYYY/MM"
              value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm text-gray-500 mb-1">分野</label>
          <select className="w-full rounded-lg border px-3 py-2 bg-white" value={field} onChange={(e) => setField(e.target.value)}>
            <option value="">すべて</option>
            <option value="エネルギー">エネルギー</option>
            <option value="製造">製造産業</option>
            <option value="情報">情報政策</option>
          </select>
        </div>
      </div>

      {/* 右寄せの検索ボタン（ダミー） */}
      <div className="max-w-3xl mx-auto mt-4 flex justify-end">
        <button className="px-6 py-2 rounded-lg bg-slate-700 text-white">検索</button>
      </div>

      {/* 結果テーブル */}
      <div className="max-w-4xl mx-auto mt-8 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">作成日</th>
              <th className="px-4 py-3 text-left">政策名</th>
              <th className="px-4 py-3 text-left">担当者</th>
              <th className="px-4 py-3 text-left">所属</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filtered.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">
                  <a href={`/project/${r.id}`} className="text-sky-700 underline">{r.title}</a>
                </td>
                <td className="px-4 py-3">{r.owner}</td>
                <td className="px-4 py-3">{r.bureau}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="px-4 py-6 text-center text-gray-400" colSpan={4}>該当する結果がありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}