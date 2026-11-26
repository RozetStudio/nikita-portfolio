import type { Project } from "@/types/project";
import { CATEGORY_LABELS } from "@/lib/projects";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { withBase } from "@/config/site";

/**
 * Единственная карточка работы. Принимает только объект проекта.
 * Все размеры, радиусы, тени и hover-эффекты заданы здесь и не
 * переопределяются в секции.
 */
export function ProjectCard({ project }: { project: Project }) {
  const href = project.link && project.link.trim() !== "" ? project.link : undefined;
  const cover = /^https?:\/\//i.test(project.cover) ? project.cover : withBase(project.cover);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition duration-300 ease-out-expo hover:-translate-y-1 hover:border-line-strong">
      <div className="relative overflow-hidden border-b border-line">
        <img
          src={cover}
          alt={`Превью проекта: ${project.title}`}
          width={1200}
          height={900}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full object-cover transition duration-500 ease-out-expo will-change-transform group-hover:scale-[1.04]"
        />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge>{CATEGORY_LABELS[project.category]}</Badge>
          {project.example && <Badge tone="strong">Пример</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-baseline justify-between gap-3">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold tracking-[-0.02em] text-fg after:absolute after:inset-0 after:rounded-card after:content-[''] hover:text-white"
            >
              {project.title}
              <span className="sr-only"> (откроется в новой вкладке)</span>
            </a>
          ) : (
            <h3 className="text-lg font-semibold tracking-[-0.02em]">{project.title}</h3>
          )}
          <span className="shrink-0 text-xs text-fg-dim">{formatDate(project.date)}</span>
        </div>

        {project.client && <p className="text-[13px] text-fg-dim">{project.client}</p>}

        <p className="line-clamp-2 text-sm leading-relaxed text-fg-muted">{project.description}</p>

        <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Технологии проекта">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-md border border-line bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-fg-dim"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
