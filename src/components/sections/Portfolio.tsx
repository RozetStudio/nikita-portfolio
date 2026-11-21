import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { allProjects, getCategories } from "@/lib/projects";
import { cn } from "@/lib/cn";
import { ProjectCard } from "../portfolio/ProjectCard";
import { ProjectEmpty } from "../portfolio/ProjectEmpty";
import { StarIcon } from "../portfolio/StarIcon";

/**
 * Секция портфолио. Карточки рендерятся только через map по данным,
 * захардкоженных карточек нет. Фильтр строится из уникальных категорий.
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
    <section
      id="portfolio"
      aria-labelledby="portfolio-title"
      className="relative scroll-mt-24 py-20 sm:py-28 lg:py-32"
    >
      {/* мягкое свечение позади секции */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 left-1/2 h-[380px] w-[720px] max-w-full -translate-x-1/2 rounded-full bg-white/[0.04] blur-[120px]"
      />

      <div className="container-page relative">
        {/* Заголовок секции */}
        <div className="flex flex-col items-center gap-4 text-center" data-reveal>
          <span className="section-badge">
            <StarIcon className="h-3 w-3 text-white/80" />
            Портфолио
          </span>
          <h2
            id="portfolio-title"
            className="max-w-[760px] text-[clamp(2rem,4.6vw,4rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
          >
            Работы
          </h2>
          <p className="max-w-[620px] text-[15px] leading-relaxed text-fg-muted sm:text-base">
            Лендинги, боты, вёрстка и автоматизация — от идеи до запуска.
          </p>
        </div>

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
      </div>
    </section>
  );
}
