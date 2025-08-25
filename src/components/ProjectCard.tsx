import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = { 
  title: string; 
  desc: string; 
  img?: string; 
  href?: string;
  hasProgress?: boolean;
};

export default function ProjectCard({ title, desc, img, href, hasProgress }: Props) {
  const router = useRouter();
  // デバッグ用ログ
  console.log('ProjectCard rendered:', { title, href, hasProgress });

  const content = (
    <div
      className={`relative rounded-2xl border p-6 shadow-[0_3px_10px_rgba(0,0,0,0.05)] transition-shadow
        ${href ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-60'}
        ${hasProgress ? "border-sky-400 bg-sky-50" : "border-sky-200 bg-white"}`}
      onClick={() => {
        if (href) router.push(href);
      }}
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

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  
  return content;
}