# Никита — личный лендинг-портфолио

Тёмный монохромный одностраничный сайт: лендинги, Telegram-боты, вёрстка и скрипты.
Собран на Astro + React-островах, стили Tailwind CSS v4, анимации Motion и Lenis,
живой WebGL-фон в hero, полный запуск в Docker.

- План работ и решения: [PLAN.md](PLAN.md)
- Как добавить работу в портфолио: [PORTFOLIO_GUIDE.md](PORTFOLIO_GUIDE.md)
- Лицензии ассетов: [LICENSES.md](LICENSES.md)

## Стек

| Слой | Технология |
|---|---|
| Каркас | Astro 7 (static output), TypeScript strict |
| Интерактив | React 19-остров (фильтр портфолио), Motion 14 |
| Стили | Tailwind CSS v4 (`@theme`-токены), кастомный silk-шейдер на WebGL2 |
| UI | shadcn-паттерн (cva-варианты Button/Badge), паттерны 21st.dev |
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

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните. Файл `.env` не коммитится.

```dotenv
# Публичный адрес сайта: включает canonical, OG-ссылки и sitemap.
# Пример: https://nikita.example
PUBLIC_SITE_URL=

# Ссылки на профили. Пока не известны — оставьте пустыми:
# кнопки покажут подсказку «Ссылка скоро появится».
# TODO: заполнить позже. Примеры: https://t.me/username, https://vk.com/username
TELEGRAM_URL=
VK_URL=
```

Важно: сайт статический, значения читаются на этапе сборки. После изменения
`.env` пересоберите контейнер: `docker compose up --build`.

Заглушки считаются корректными, если ссылка пустая, начинается с `#` или равна `TODO`.

## Портфолио

Все работы лежат в одном файле `src/data/projects.json` (схема и правила — в
[PORTFOLIO_GUIDE.md](PORTFOLIO_GUIDE.md)):

- карточка рендерится единственным компонентом `src/components/portfolio/ProjectCard.tsx`;
- фильтр по категориям строится автоматически из уникальных значений `category`;
- пустой массив → нейтральная заглушка «Работы скоро появятся»;
- порядок: сначала `featured: true`, внутри групп — как в файле;
- превью: `public/portfolio/<id>.webp`, 1200×900 (4:3), имя файла = `id`.

Процедура добавления одной фразой для агента: **«добавь работу: <название, категория,
клиент, описание, стек, ссылка, дата, превью>»** — дальше по шагам из
`PORTFOLIO_GUIDE.md` (конвертация превью, запись в конец JSON, удаление
демо-проекта с `example: true` при первой реальной работе, сборка, линтер,
коммит `add project: <title>` в `test/landing`).

В проекте лежит один демонстрационный проект (`landing-coffee-shop`,
`example: true`) — он показывает сетку и фильтр и удаляется при первой
реальной работе вместе с превью.

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
| `npm run cover -- <img> <id>` | конвертация превью: 4:3, 1200×900, WebP |
| `npm run icons` | регенерация `apple-touch-icon.png` из `favicon.svg` |

## Проверки качества

- Lighthouse (последний прогон): Accessibility 100, Best Practices 100, SEO 100.
- Адаптив: 320 / 390 / 768 / 1024 / 1440 / 1920, mobile-first.
- `prefers-reduced-motion`: анимации и WebGL-фон отключаются, остаётся CSS-fallback.
- Контраст текста ≥ 4.5:1, видимый focus-visible, клавиатурная навигация.
- Вывод JS в hero: шейдер стартует после загрузки, пауза вне вьюпорта и в скрытой вкладке, DPR ≤ 1.5 (десктоп) / ≤ 1 (мобайл).

## Публикация репозитория (GitHub Desktop)

`gh` CLI в этой системе не установлен, поэтому репозиторий публикуется вручную:

1. File → Add local repository… → выбрать папку проекта.
2. Publish repository → отметить «Keep this code private».
3. Переключиться на ветку `test/landing` и запушить её (Repository → Push).
4. Открыть draft pull request `test/landing` → `main` на github.com.

Все коммиты локально уже сделаны агентом; main в remote не пушится.

Если появится GitHub CLI: `gh repo create nikita-portfolio --private --source=. --remote=origin`,
затем `gh pr create --draft --base main --head test/landing`.

## Структура

```
├── Dockerfile / Dockerfile.dev / docker-compose*.yml / nginx.conf
├── scripts/                 # validate, cover, icons, qa-screenshots
├── public/
│   ├── fonts/               # Manrope Variable (OFL-1.1)
│   ├── portfolio/           # превью работ (4:3, ≤1200px)
│   └── favicon.svg / og.png / site.webmanifest
└── src/
    ├── components/
    │   ├── layout/          # Header (native dialog-меню), Footer
    │   ├── sections/        # Hero, TechMarquee, Services, Process,
    │   │                    # Portfolio (React-остров), WhyMe, Contact
    │   ├── portfolio/       # ProjectCard, ProjectEmpty, StarIcon
    │   ├── ui/              # StarMark, SectionBadge, SectionHeading,
    │   │                    # button.tsx / badge.tsx (shadcn-паттерн)
    │   └── visuals/         # SilkBackground (WebGL) и мини-визуалы карточек
    ├── config/site.ts       # env + заглушки Telegram/VK
    ├── data/projects.json   # ← данные портфолио
    ├── lib/                 # cn, ui (cva), format, projects (Zod)
    ├── layouts/BaseLayout.astro
    ├── pages/               # index, 404, robots.txt, og-preview, demo-cover
    ├── scripts/             # silk.ts, reveal, spotlight, smooth-scroll, header
    └── styles/global.css    # токены @theme, компонентные классы, grain и т.д.
```

## Известные заглушки

- `TELEGRAM_URL` и `VK_URL` не заполнены: кнопки в контактах и ссылки в футере
  показывают «скоро» и не ведут на выдуманные адреса. Заполняются в `.env`.
- `PUBLIC_SITE_URL` не задан: canonical и sitemap не генерируются (в `.env.example` есть TODO).
- Демо-проект «Кофейня Зерно» (`example: true`) — удалить при первой реальной работе.
