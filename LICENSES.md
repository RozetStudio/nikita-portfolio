# Лицензии и источники ассетов

В проекте используются только ассеты с лицензией, допускающей коммерческое использование, либо созданные для этого проекта.

## Шрифт

| Файлы | Шрифт | Лицензия |
|---|---|---|
| `public/fonts/manrope-*-wght-normal.woff2` | Manrope Variable | SIL Open Font License 1.1 — полный текст: `public/fonts/OFL.txt` |

Шрифт подключается сам хостингом (self-host), внешние CDN не используются.

## Иконки

| Пакет | Лицензия | Использование |
|---|---|---|
| `lucide` (`@lucide/astro`, `lucide-react`) | ISC | интерфейсные иконки |
| `simple-icons` | CC0-1.0 | логотипы технологий в ленте |

## Код и стили

- Astro, React, Tailwind CSS, Motion, Lenis, Zod — MIT/Apache-2.0/OFL, стандартные open-source лицензии.
- Компоненты и паттерны (Spotlight Card, Infinite Marquee, Bento Grid, silk-шейдер hero) написаны под этот проект; идеи взяты из открытой витрины [21st.dev](https://21st.dev) (в т.ч. Silk shader / Silky Moving Background как визуальные референсы), код не скопирован 1:1.

## Изображения

- `public/portfolio/banny-domik.webp` и `public/portfolio/xgame-club.webp` — скриншоты клиентских лендингов, сняты локально с исходников проектов; внешних ассетов нет.
- `public/portfolio/telegram-bot.webp` — скриншот интерфейса Telegram-бота (личные чаты исключены), собран для карточки портфолио.
- `public/og.png` — сгенерирован из служебной страницы проекта.

## Не входит в репозиторий

- `.env` (секреты и ссылки) — только `.env.example`.
