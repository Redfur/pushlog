# pushlog

Локальное PWA-приложение для учёта подходов (повторений) по типам упражнений: быстрый ввод, экран дня с календарём, статистика и настройки. Данные хранятся в **IndexedDB** в браузере, без бэкенда.

## Стек

React 19, Vite 8, TypeScript, Zustand, react-router-dom, react-i18next, Tailwind CSS 4, shadcn/ui (Radix), IndexedDB через `idb`, PWA (`vite-plugin-pwa`).

## Команды

| Команда | Назначение |
|---------|------------|
| `npm run dev` | Режим разработки |
| `npm run build` | Сборка (`tsc -b` + Vite) |
| `npm run preview` | Просмотр production-сборки |
| `npm run check` | Biome: линт и форматирование |
| `npm run check:fix` | То же с автоисправлением |
| `npm run knip` | Поиск неиспользуемых экспортов и файлов (см. `knip.json`) |

## Документация

- **Спецификации (источник сценариев и домена):** [spec/README.md](spec/README.md)
- **Правила кода и FSD:** [docs/coding-standards.md](docs/coding-standards.md)

При изменении поведения или структуры проекта обновляйте соответствующие файлы в `spec/`.
