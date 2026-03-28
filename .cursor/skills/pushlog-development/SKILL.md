---
name: pushlog-development
description: Разработка Push log по спецификациям. Использовать при реализации фич, рефакторинге или когда пользователь просит разработать/реализовать что-то в проекте pushlog.
---

# Разработка Push log

## Перед началом

1. **Прочитать релевантные спецификации** в `spec/`:
   - spec/README.md — индекс документов (корень репозитория)
   - spec/solution-overview.md — поток работы и сценарии
   - spec/requirements.md — MVP, user stories, edge cases
   - spec/concepts.md — термины (Set, DayLog, Streak, Goal, ExerciseType)
   - spec/domain.md — доменные модели, примеры данных
   - spec/ui.md — экраны и компоненты
   - spec/architecture.md — FSD-слои, Zustand, StorageAdapter, data flow
   - spec/non-functional.md — производительность, offline, хранение

2. **Проверить правила кода** в docs/coding-standards.md:
   - FSD: app → pages → widgets → features → entities → shared
   - Публичный API через index.ts
   - Локализация: переводы внутри слайса, injectTranslation, useTranslation

## Workflow

1. Определить, в какой слой/слайс помещается код
2. Создать структуру по FSD (ui, model, api и т.д.)
3. Реализовать, сверяясь со спецификацией
4. Добавить переводы в слайс (translations.ts, TRANS_NS)
5. **Актуализировать спецификацию** — при любых изменениях обновлять spec/
6. Запустить `npm run check` перед завершением

## Стек

- shadcn + Tailwind — UI. Компоненты в `src/components/ui/`, импорт: `@/components/ui/...`
- Общие хуки уровня приложения (например «сегодня» по таймзоне store): `src/hooks/`
- **Формы и контролы:** не использовать в слайсах голые `<input>`, `<select>`, `<textarea>`, нативные checkbox/radio, если есть shadcn-аналог. Порядок: (1) `src/components/ui/`, (2) `npx shadcn@latest add <component>`, (3) только при отсутствии в реестре — свой компонент.

## Ключевые решения (из spec)

- IndexedDB (через `idb`) + абстракция `StorageAdapter` в shared
- Zustand — `usePushlogStore` в `src/entities/pushup/model/pushlog-store.ts`
- react-i18next, колоцированные переводы
- Домен: учёт подходов (отжимания), local-first, без бэкенда в MVP
