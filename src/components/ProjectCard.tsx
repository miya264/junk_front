import Link from "next/link";

type Props = { 
  title: string; 
  desc: string; 
  img?: string; 
  href?: string;
  hasProgress?: boolean;
};

export default function ProjectCard({ title, desc, img, href, hasProgress }: Props) {
  const content = (
    <div
      className={`relative rounded-2xl border p-6 shadow-[0_3px_10px_rgba(0,0,0,0.05)]
        ${hasProgress ? "border-sky-400 bg-sky-50" : "border-sky-200 bg-white"}`}
    >
      <h3 className="font-semibold mb-2 pr-28">{title}</h3>
      <div className="h-[1px] bg-gray-200 mb-3" />
      <p className="text-sm text-gray-600 pr-28">{desc}</p>
      {img && (
        <div className="absolute right-4 bottom-4">
          <img
            src={img}
            alt={title}
            className="h-24 w-auto object-contain pointer-events-none select-none"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}