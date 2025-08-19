export default function ProjectTags({ bureau, members = [] as string[] }:{
  bureau?: string; members?: string[];
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {bureau && <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{bureau}</span>}
      {members.map((m) => (
        <span key={m} className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
          {m} <span className="text-gray-400 text-xs ml-1">×</span>
        </span>
      ))}
    </div>
  );
}