import { StarIcon } from "./StarIcon";

/** Пустое состояние портфолио: показывается, когда массив работ пуст. */
export function ProjectEmpty() {
  return (
    <div className="mt-12 flex flex-col items-center gap-4 rounded-card border border-dashed border-line-strong bg-surface/50 px-6 py-16 text-center sm:mt-16">
      <StarIcon className="h-8 w-8 text-fg-dim" />
      <h3 className="text-xl font-semibold tracking-[-0.02em]">Работы скоро появятся</h3>
      <p className="max-w-[440px] text-sm leading-relaxed text-fg-muted">
        Сейчас собираю первые кейсы. Напишите — покажу процесс на вашей задаче.
      </p>
      <a href="#contact" className="btn btn-outline btn-sm mt-2">
        Обсудить проект
      </a>
    </div>
  );
}
