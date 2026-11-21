export type ProjectCategory = "landing" | "bot" | "layout" | "script";

export interface Project {
  /** slug латиницей, например "landing-coffee-shop" */
  id: string;
  /** название работы */
  title: string;
  /** одна из категорий */
  category: ProjectCategory;
  /** тип клиента или проекта, например "Кофейня" */
  client?: string;
  /** 1–2 предложения о задаче и результате */
  description: string;
  /** технологии */
  stack: string[];
  /** путь к превью, например "/portfolio/landing-coffee-shop.webp" */
  cover: string;
  /** ссылка на демо или кейс (необязательно) */
  link?: string;
  /** год и месяц, формат "2026-03" */
  date: string;
  /** показывать в начале списка */
  featured: boolean;
  /** демонстрационная запись; удаляется при добавлении первой реальной работы */
  example?: boolean;
}
