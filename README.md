# Никита — личный лендинг-портфолио

Тёмный монохромный одностраничный сайт: лендинги, Telegram-боты, вёрстка и скрипты.
Собран на Astro + React-островах, стили Tailwind CSS v4, анимации Motion и Lenis,
живой WebGL-фон в hero, полный запуск в Docker.

Лицензии ассетов: [LICENSES.md](LICENSES.md).

## Стек

| Слой | Технология |
|---|---|
| Каркас | Astro 7 (static output), TypeScript strict |
| Интерактив | React 19-остров (фильтр портфолио), Motion 14 |
| Стили | Tailwind CSS v4 (`@theme`-токены), кастомный silk-шейдер на WebGL2 |
| UI | shadcn-паттерн (Badge), паттерны 21st.dev |
| Скролл | Lenis (отключается при `prefers-reduced-motion`) |
| Иконки | Lucide (`@lucide/astro`), Simple Icons (CC0) |
| Шрифт | Manrope Variable (OFL-1.1, self-host) |
| Валидация | Zod (схема `projects.json`) |
| Контейнеры | Docker multi-stage → nginx, Compose prod/dev |

## Быстрый старт

Нужен только Docker Desktop.

```bash
# Продакшн-сборка и запуск (nginx, порт 8080)
docker compose up --build
# → http://localhost:8080

# Разработка с hot reload (порт 4321)
docker compose -f docker-compose.dev.yml up
# → http://localhost:4321
```

- Прод-контейнер отдаёт статику через nginx: gzip, долгий кэш `/_astro/`, security-заголовки, CSP, страница 404.
- Dev-контейнер монтирует исходники (`CHOKIDAR_USEPOLLING=true` для Windows), зависимости живут в named volume `node_modules`.
- Продакшн и разработка могут работать одновременно (отдельные compose-проекты, порты 8080 и 4321).

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните. Файл `.env` не коммитится.

```dotenv
# Публичный адрес сайта: включает canonical, OG-ссылки и sitemap.
# Пример: https://nikita.example
PUBLIC_SITE_URL=

# Ссылки на профили.
# Примеры: https://t.me/username, https://vk.com/username
TELEGRAM_URL=
VK_URL=
```

Важно: сайт статический, значения читаются на этапе сборки. После изменения
`.env` пересоберите контейнер: `docker compose up --build`.

Заглушки считаются корректными, если ссылка пустая, начинается с `#` или равна `TODO`.

## Портфолио

Все работы лежат в одном файле `src/data/projects.json`. Новая работа:

1. превью `public/portfolio/<id>.webp` — WebP, соотношение 4:3, ширина ≤1200 px, имя файла = `id`;
2. объект в конец массива строго с полями:
   `id` (slug латиницей), `title`, `category` (`landing`/`bot`/`layout`/`script`),
   `client`, `description`, `stack`, `cover`, `link`, `date` (`YYYY-MM`), `featured`;
3. `npm run validate` — проверит схему, уникальность `id` и наличие файла превью.

Правила системы:

- карточку рендерит единственный компонент `src/components/portfolio/ProjectCard.tsx` —
  вёрстку и секцию при добавлении работы менять не нужно;
- фильтр по категориям строится автоматически из уникальных значений `category`;
- пустой массив → нейтральная заглушка «Работы скоро появятся»;
- порядок: сначала `featured: true`, внутри групп — как в файле.

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер Astro (локально, вне Docker) |
| `npm run build` | валидация данных + сборка статики |
| `npm run preview` | локальный просмотр сборки |
| `npm run check` | проверка типов (astro check) |
| `npm run lint` | ESLint (astro + typescript-eslint + react-hooks) |
| `npm run format` | Prettier (astro + tailwindcss плагины) |
| `npm run validate` | проверка `projects.json` (Zod, файл превью, один `example`) |
| `npm run test:legal` | проверка собранной страницы `/terms/` (после `npm run build`) |

## Документы

- `/terms/` — пользовательское соглашение: условия работы, оплаты, приёмки, возврата,
  конфиденциальности и реквизиты.
- Ссылка на документ живёт в футере; отдельным пунктом в меню она не выводится.
- Страница индексируемая. При заданном `PUBLIC_SITE_URL` попадает в sitemap автоматически.

## Проверки качества

- Lighthouse (последний прогон): Accessibility 100, Best Practices 100, SEO 100.
- `/terms/`: Lighthouse Accessibility 100, Best Practices 100, SEO 100.
- Адаптив: 320 / 390 / 768 / 1024 / 1440 / 1920, mobile-first.
- `prefers-reduced-motion`: анимации и WebGL-фон отключаются, остаётся CSS-fallback.
- Контраст текста ≥ 4.5:1, видимый focus-visible, клавиатурная навигация.
- Вывод JS в hero: шейдер стартует после загрузки, пауза вне вьюпорта и в скрытой вкладке, DPR 1.

## Публикация репозитория (GitHub Desktop)

Репозиторий уже связан с `origin` (`https://github.com/RozetStudio/nikita-portfolio.git`).
Обновления публикуются через GitHub Desktop: Fetch origin → Push (ветка `main`).
Для экспериментов создавайте отдельную ветку от `main`; `test/landing` — архивная и не используется.

## Структура

```
├── Dockerfile / Dockerfile.dev / docker-compose*.yml / nginx.conf
├── scripts/                   # validate-projects, check-legal (проверка /terms/)
├── public/
│   ├── fonts/                 # Manrope Variable (OFL-1.1)
│   ├── portfolio/             # превью работ (4:3, ≤1200px)
│   └── favicon.svg / og.png / site.webmanifest
└── src/
    ├── components/
    │   ├── layout/            # Header (native dialog-меню), Footer
    │   ├── sections/          # Hero, TechMarquee, Services, Process,
    │   │                      # Portfolio (React-остров), WhyMe, Contact
    │   ├── portfolio/         # ProjectCard, ProjectEmpty, StarIcon
    │   ├── ui/                # StarMark, SectionBadge, SectionHeading, Badge
    │   └── visuals/           # SilkBackground (WebGL) и мини-визуалы карточек
    ├── config/site.ts         # env + заглушки Telegram/VK
    ├── data/projects.json     # ← данные портфолио
    ├── lib/                   # cn, format, projects (Zod)
    ├── layouts/BaseLayout.astro
    ├── pages/                 # index, 404, terms, robots.txt
    ├── scripts/               # silk.ts, reveal, spotlight, smooth-scroll, header
    └── styles/global.css      # токены @theme, компонентные классы, grain и т.д.
```

## Известные заглушки

- `PUBLIC_SITE_URL` не задан: canonical и sitemap не генерируются (в `.env.example` есть TODO).
