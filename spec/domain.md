# Домен

## Принципы

- Расширяемость: новые типы упражнений без ломки `Set` — через `exerciseTypeId`.
- Стабильные идентификаторы: `id` у сущностей, хранимых в БД — строка (UUID).
- Время: `createdAt` — ISO 8601 (UTC); календарный день — отдельное поле `dayKey` (`YYYY-MM-DD` в целевой timezone) для простых запросов и будущего heatmap.

## TypeScript-модели

### Branded / алиасы (рекомендация для реализации)

- `DayKey` — строка формата `YYYY-MM-DD`.
- `ExerciseTypeId` — string.
- `SetId`, `GoalId` — string.

### Set

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | string | UUID |
| `exerciseTypeId` | string | UUID типа из каталога `exerciseTypes` (IndexedDB) |
| `reps` | number | Целое > 0 |
| `createdAt` | string | ISO UTC |
| `dayKey` | string | День пользователя для индексации |
| `version` | number | Опционально, для будущих миграций записей |

### DayLog (виртуальный / view-модель)

| Поле | Тип | Описание |
|------|-----|----------|
| `dayKey` | string | |
| `sets` | Set[] | Отсортировано по `createdAt` ascending |
| `totalReps` | number | Сумма `reps` |
| `goalProgress` | number \| null | Если цель задана — `totalReps / goal.targetReps` или абсолют; иначе null |

Персистится как агрегат опционально только для оптимизации; в MVP достаточно вычислять из `Set`.

### Stats

| Поле | Тип | Описание |
|------|-----|----------|
| `totalRepsAllTime` | number | |
| `totalSetsAllTime` | number | |
| `activeDaysCount` | number | Дни с ≥1 подходом |
| `averageRepsPerActiveDay` | number \| null | `totalRepsAllTime / activeDaysCount`, если activeDaysCount > 0 |
| `bestDay` | `{ dayKey: string; totalReps: number } \| null` | Максимум суммы за день; при отсутствии данных — null |
| `currentStreak` | number | Дней подряд с активностью; MVP может быть 0 всегда в UI |
| `periodFrom` / `periodTo` | string? | Опционально для фильтра «за месяц» позже |

### Goal

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | string | UUID |
| `exerciseTypeId` | string | К какому типу относится |
| `targetRepsPerDay` | number | MVP-вариант дневной цели |
| `effectiveFrom` | string | ISO date или dayKey начала |
| `updatedAt` | string | ISO |

Персист в IndexedDB: объект **нескольких** целей в `meta.goalsByExerciseTypeId` (ключ — `exerciseTypeId`); ранее — одно поле `goal`, мигрируется при чтении.

Расширение: `period: 'day' \| 'week'` без ломки — новые поля с дефолтами.

## Примеры данных

### Пресеты (конфиг, не БД)

```json
{
  "quickAddPresets": [10, 20]
}
```

### PersistedExerciseType (IndexedDB `exerciseTypes`)

| Поле | Описание |
|------|----------|
| `id` | UUID |
| `name` | Пользовательское имя |
| `iconKey` | Ключ пресета иконки (Lucide) |
| `colorKind` | `preset` \| `custom` |
| `colorValue` | `chart-1`… или `#RRGGBB` |
| `archivedAt` | ISO или `null` (архив — не в селекторах, данные и статистика сохраняются) |

### Набор Set (несколько дней)

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "exerciseTypeId": "exercise.pushups",
    "reps": 20,
    "createdAt": "2026-03-28T08:15:00.000Z",
    "dayKey": "2026-03-28",
    "version": 1
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "exerciseTypeId": "exercise.pushups",
    "reps": 15,
    "createdAt": "2026-03-28T08:16:30.000Z",
    "dayKey": "2026-03-28",
    "version": 1
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "exerciseTypeId": "exercise.pushups",
    "reps": 40,
    "createdAt": "2026-03-27T22:00:00.000Z",
    "dayKey": "2026-03-27",
    "version": 1
  }
]
```

### Goal

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "exerciseTypeId": "exercise.pushups",
  "targetRepsPerDay": 50,
  "effectiveFrom": "2026-03-01",
  "updatedAt": "2026-03-28T10:00:00.000Z"
}
```

### Stats (пример вычисления по данным выше)

```json
{
  "totalRepsAllTime": 75,
  "totalSetsAllTime": 3,
  "activeDaysCount": 2,
  "averageRepsPerActiveDay": 37.5,
  "bestDay": { "dayKey": "2026-03-28", "totalReps": 35 },
  "currentStreak": 2
}
```
