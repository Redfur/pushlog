# Архитектура

## Feature-Sliced Design (привязка к репозиторию)

| Слой | Папка | Роль в Push log |
|------|--------|-----------------|
| App | `src/app/` | Провайдеры (i18n, theme), **инициализация store**, подключение persistence |
| Pages | `src/pages/` | Маршруты: главная, статистика (композиция виджетов) |
| Widgets | `src/widgets/` | Крупные блоки экранов: `main-screen`, `stats` |
| Features | `src/features/` | Пользовательские действия: `add-set`, `remove-set` (тонкие обёртки над store + UX) |
| Entities | `src/entities/` | Домен: `pushup` (типы, представление Set/Goal, мелкие UI-кирпичи) |
| Shared | `src/shared/` | `lib/` (дата, timezone, id), `config/` (пресеты, exercise id), **storage abstraction** |
| UI-kit | `src/components/ui/` | shadcn — без бизнес-логики |

Импорт: только снизу вверх по слоям; `app` и `shared` — по правилам проекта.

## Размещение новых слайсов

| Слайс | Путь |
|-------|------|
| Сущность упражнения / отжимания | `src/entities/pushup/` (`model/types.ts`, при необходимости `ui/`) |
| Добавление подхода | `src/features/add-set/` |
| Удаление подхода | `src/features/remove-set/` |
| Главный экран | `src/widgets/main-screen/` |
| Статистика | `src/widgets/stats/` |

Публичный API каждого слайса — только через `index.ts`.

## State management: Zustand

**Расположение:** `src/app/store/` (согласовано с `docs/coding-standards.md`), например:

- `src/app/store/pushlog-store.ts` — создание store
- `src/app/store/hooks.ts` — селекторы при необходимости

**Структура состояния (логическая)**

- `sets: Set[]` — кэш в памяти после гидрации из IndexedDB, либо нормализованное хранение по `id`
- `goal: Goal | null`
- `ui: { isHydrated: boolean; lastError: string | null }` — опционально
- Производные **не обязаны** жить в state: `getTodaySets`, `computeStats`, `computeStreak` — функции селекторов/утилит в `entities/pushup/model` или рядом со store

**Actions (методы store)**

| Action | Назначение |
|--------|------------|
| `hydrate()` | Загрузка из `StorageAdapter` при старте |
| `addSet(input)` | Создать `Set` (uuid, `dayKey` из `now`), append, запись в storage |
| `removeSet(id)` | Удалить по id, обновить storage |
| `getTodaySets()` | Фильтр по текущему `dayKey` (timezone из shared) |
| `computeStats()` | Вернуть `Stats` по текущему массиву sets (+ goal при необходимости) |
| `computeStreak()` | По множеству `dayKey`; для MVP можно вернуть число без отображения |
| `setGoal` / `clearGoal` | Опционально MVP |

Асинхронность: `hydrate` async; `addSet`/`removeSet` — async к storage, но UI обновляется оптимистично или с микролагом < целевого UX.

## Storage abstraction

**Интерфейс (концептуально), расположение:** `src/shared/lib/storage/` или `src/shared/api/storage/`

```ts
// Контракт (описание для реализации)
interface StorageAdapter {
  getAllSets(): Promise<Set[]>
  putSet(set: Set): Promise<void>
  deleteSet(id: string): Promise<void>
  getGoal(): Promise<Goal | null>
  putGoal(goal: Goal): Promise<void>
  // Версия схемы для миграций
  getMeta(): Promise<{ schemaVersion: number }>
  setMeta(m: { schemaVersion: number }): Promise<void>
}
```

**Реализация MVP:** IndexedDB через пакет `idb` (уже в зависимостях), object stores: `sets`, `meta`, `goals`.

**Будущее:** `ApiStorageAdapter` с тем же интерфейсом; выбор адаптера в `app` при старте (env).

## Data flow

```
UI (pages/widgets)
    → feature (add-set / remove-set) вызывает action
        → Zustand store обновляет память
            → StorageAdapter.persist (IndexedDB)
```

Обратный поток при старте:

```
app mount → hydrate() → StorageAdapter.get* → store → UI
```

Подписка UI на store через хуки Zustand; тяжёлые вычисления stats — `useMemo` в селекторах или отдельные маленькие хуки в `entities/pushup`.

## Переиспользование существующего кода

- `@/components/ui/*` — кнопки, layout, skeleton
- `@/shared/lib/id.ts` — `generateId()` для новых `Set`/`Goal`
- `@/shared/lib/utils.ts`, theme — как есть
- `@/shared/config/*` — пресеты quick-add, `DEFAULT_EXERCISE_TYPE_ID`
- `@/shared/i18n` — базовые ключи; новые строки — в слайсах через `injectTranslation`

## Тестируемость

- Чистые функции `computeStats` / `computeStreak` / `dayKeyFromDate` — unit-тесты без React.
- `StorageAdapter` — мок в тестах store.
