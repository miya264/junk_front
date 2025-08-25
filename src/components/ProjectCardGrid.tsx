import ProjectCard from './ProjectCard';

export type CardItem = { title: string; desc: string; img?: string };

export default function ProjectCardGrid({ items }: { items: CardItem[] }) {
  return (
    <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((c) => <ProjectCard key={c.title} {...c} />)}
    </section>
  );
}
