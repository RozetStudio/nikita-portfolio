import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { allProjects, getCategories } from "@/lib/projects";
import { cn } from "@/lib/cn";
import { ProjectCard } from "../portfolio/ProjectCard";
import { ProjectEmpty } from "../portfolio/ProjectEmpty";

/**
 * Остров портфолио: фильтры и сетка. Секция и заголовок рендерятся
 * в Astro (index.astro), чтобы React не управлял reveal-узлами.
 * Карточки рендерятся только через map по данным, захардкоженных нет.
 */
export default function Portfolio() {
  const [active, setActive] = useState<"all" | string>("all");
  const prefersReducedMotion = useReducedMotion();

  const categories = getCategories();
  const visible = useMemo(
    () => (active === "all" ? allProjects : allProjects.filter((p) => p.category === active)),
    [active],
  );

  return (
    <>
      {allProjects.length === 0 ? (
        <ProjectEmpty />
      ) : (
        <>
          {/* Фильтр: кнопки строятся из уникальных категорий в данных */}
          <div
            role="group"
            aria-label="Фильтр работ"
            className="mt-10 flex flex-wrap justify-center gap-2 sm:mt-12"
          >
            <button
              type="button"
              onClick={() => setActive("all")}
              aria-pressed={active === "all"}
              className={cn("chip", active === "all" && "chip-active")}
            >
              Все
            </button>
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setActive(category.value)}
                aria-pressed={active === category.value}
                className={cn("chip", active === category.value && "chip-active")}
              >
                {category.label}
              </button>
            ))}
          </div>

          <p aria-live="polite" className="sr-only">
            Показано работ: {visible.length}
          </p>

          <motion.ul
            layout
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((project) => (
                <motion.li
                  key={project.id}
                  layout
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  <ProjectCard project={project} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </>
      )}
    </>
  );
}
