# Архитектура

## Feature-Sliced Design (привязка к репозиторию)

| Слой | Папка | Роль в Push log |
|------|--------|-----------------|
| App | `src/app/` | Провайдеры (i18n, theme), **инициализация store**, подключение persistence |
| Pages | `src/pages/` | `/` (главная), `/day/:dayKey`, `/exercises/new`, `/exercises/:exerciseId`, `/exercises/:exerciseId/edit`, `/stats`, `/stats/exercise/:exerciseId`, `/settings` |
| Widgets | `src/widgets/` | `home-screen`, `main-screen` (день), `stats`, `settings-screen` |
| Features | `src/features/` | `add-set`, `remove-set`, `select-exercise`, `set-daily-goal`, `manage-exercises`, `set-timezone` |
| Entities | `src/entities/` | Домен: `pushup` (типы, Zustand store, `computeStats` / `computeStreak` / фильтры) |
| Shared | `src/shared/` | `lib/` (дата, timezone, id, **storage**), `config/`, `i18n`, **`layout/`** (липкая шапка **PageHeader**, **ScreenBody**, **STICKY_PAGE_HEADER_SURFACE**, скелетон и кнопка «назад» — импорт `@/shared/layout`) |
| UI-kit | `src/components/ui/` | shadcn — без бизнес-логики |

Перекрёстные хуки приложения (например «сегодня» по таймзоне store): `src/hooks/` — не FSD-слой, но используются страницами/виджетами.

Импорт: только снизу вверх по слоям; `app` и `shared` — по правилам проекта.

## Размещение новых слайсов

| Слайс | Путь |
|-------|------|
| Каркас экрана (шапка, тело) | `src/shared/layout/` — `@/shared/layout` |
| Сущность упражнения / отжимания | `src/entities/pushup/` (`model/types.ts`, store, при необходимости `ui/`) |
| Добавление подхода | `src/features/add-set/` |
| Удаление подхода | `src/features/remove-set/` |
| Главная | `src/widgets/home-screen/` |
| Экран дня | `src/widgets/main-screen/` (`DayScreen`) |
| Статистика | `src/widgets/stats/` |

Публичный API каждого слайса — только через `index.ts`.

## State management: Zustand

**Расположение:** `src/entities/pushup/model/pushlog-store.ts` (store рядом с доменом, чтобы слой `features` не импортировал `app`).

- Экспорт: `usePushlogStore` из `@/entities/pushup`
- Гидрация при старте: `PushlogHydrationProvider` в `src/app/providers/` (`pushlog-hydration.tsx`)

**Структура состояния**

- `sets` — кэш подходов после гидрации из IndexedDB
- `exerciseTypesById: Record<id, PersistedExerciseType>` — каталог типов (UUID, имя, иконка/цвет, `trackWeightInSets`, `archivedAt`)
- `goalsByExercise: Record<exerciseTypeId, Goal>`
- `preferredExerciseTypeId` — только среди **активных** типов; персист в `localStorage`
- `hydrated: boolean` — гидратация завершена (успех или ошибка чтения)
- `lastError: string | null` — последняя ошибка storage / операций
- `timeZone: string` — календарный «день» пользователя; предпочтение может храниться в `localStorage` (см. `setTimeZone`)

Агрегаты **не** в store: `computeStats`, `computeStatsForExerciseType`, `computeStreak` — чистые функции в `entities/pushup/model`, импорт из `@/entities/pushup`.

**Методы store (actions)**

| Action | Назначение |
|--------|------------|
| `hydrate()` | Загрузка sets, goals, exercise types из `StorageAdapter`; восстановление preferred и таймзоны |
| `addSet(reps, options?)` | Создать подход (`dayKey`, `exerciseTypeId`, опционально `weightKg` — если у типа `trackWeightInSets`) |
| `removeSet(id)` | Удалить подход, запись в storage |
| `restoreSet(row)` | Вернуть подход (undo) |
| `setDailyGoal` / `clearDailyGoal` | Цель по `exerciseTypeId` |
| `setPreferredExerciseTypeId` | Предпочитаемый тип (active only) + `localStorage` |
| `addExerciseType` / `updateExerciseType` / `archiveExerciseType` / `unarchiveExerciseType` | Каталог в IndexedDB |
| `setTimeZone` | Часовой пояс приложения + предпочтение в `localStorage` |
| `clearError()` | Сброс `lastError` |

Асинхронность: `hydrate` и операции записи в IDB — async; UI обновляется оптимистично там, где это реализовано в фичах.

## Персистентность

**IndexedDB** (через `idb`), адаптер: **`src/shared/lib/storage/`** (`getStorageAdapter`, `indexed-db-adapter`, `contract.ts`, `schema.ts`).

Объекты хранения (логически):

- `sets` — подходы
- `exerciseTypes` — каталог типов
- `meta` — версия схемы и **`goalsByExerciseTypeId`**

**localStorage** (предпочтения клиента, не дублируют массив подходов): тема, таймзона, предпочитаемый тип упражнения — см. `src/shared/lib/client-storage-keys.ts` и `clear-client-storage.ts`.

**Интерфейс StorageAdapter** (концептуально):

```ts
interface StorageAdapter {
  getAllSets(): Promise<Set[]>
  putSet(set: Set): Promise<void>
  deleteSet(id: string): Promise<void>
  getGoals(): Promise<Record<string, Goal>>
  putGoalForExercise(goal: Goal): Promise<void>
  clearGoalForExercise(exerciseTypeId: string): Promise<void>
  getAllExerciseTypes(): Promise<PersistedExerciseType[]>
  getExerciseType(id: string): Promise<PersistedExerciseType | undefined>
  putExerciseType(row: PersistedExerciseType): Promise<void>
  deleteExerciseType(id: string): Promise<void>
}
```

Миграции: в адаптере (в т.ч. легаси `exercise.pushups` / `exercise.pullups` → UUID).

**Будущее:** `ApiStorageAdapter` с тем же интерфейсом; выбор адаптера в `app` при старте (env).

## Data flow

```
UI (pages/widgets)
    → feature (add-set / remove-set / …) вызывает action
        → Zustand store обновляет память
            → StorageAdapter → IndexedDB
```

Обратный поток при старте:

```
app mount → hydrate() → StorageAdapter.get* → store → UI
```

Подписка UI на store через хуки Zustand; тяжёлые агрегаты — `useMemo` + `computeStats` и т.д.

## Переиспользование существующего кода

- `@/components/ui/*` — кнопки, layout, skeleton
- `@/shared/lib/id.ts` — идентификаторы для новых `Set`/`Goal`
- `@/shared/lib/utils.ts`, theme — как есть
- `@/shared/config/*` — пресеты quick-add, пресеты иконок/цветов; **каталог упражнений** — в IndexedDB
- `@/shared/i18n` — базовые ключи; новые строки — в слайсах через `injectTranslation`

## Тестируемость

- Чистые функции `computeStats` / `computeStreak` / утилиты дня — unit-тесты без React.
- `StorageAdapter` — мок в тестах store.
