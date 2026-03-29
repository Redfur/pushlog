# Аналитика: Яндекс Метрика и цели

## Назначение

В production подключён счётчик Метрики ([`src/shared/lib/metrika.ts`](../src/shared/lib/metrika.ts)). Дополнительно отправляются **JavaScript-цели** (`reachGoal`) после успешных действий пользователя. Доменные записи — после persist в IndexedDB; настройки — после сохранения в `localStorage` / очистки данных.

Данные тренировок остаются локальными ([`non-functional.md`](./non-functional.md)); в Метрику уходят только идентификаторы целей и **не персональные** параметры (агрегаты). Названия типов упражнений обрезаются в коде.

## Архитектура

- [`pushlog-analytics.ts`](../src/shared/lib/pushlog-analytics.ts): класс **`YandexMetrikaAnalytics`**, наружу **`pushlogAnalytics`**.
- Идентификаторы целей и группы — [`metrika-goals.ts`](../src/shared/config/metrika-goals.ts).
- Opt-out: [`analytics-goals-preference.ts`](../src/shared/lib/analytics-goals-preference.ts), ключ **не** сбрасывается при очистке прочих настроек.

## Группы целей

### `exercise/*` — подходы, типы упражнений, цели по типу

| `goalId` | Когда срабатывает |
|----------|-------------------|
| `exercise/set_logged` | Сохранён подход |
| `exercise/create` | Создан тип упражнения |
| `exercise/edit` | Сохранено редактирование типа |
| `exercise/archive` | Тип в архиве |
| `exercise/unarchive` | Тип из архива |
| `exercise/goal_set` | Установлена или изменена дневная цель по типу |
| `exercise/goal_clear` | Дневная цель по типу снята |
| `exercise/remove` | Удалён подход (после успешного удаления в БД) |
| `exercise/preferred_change` | Сменён предпочитаемый тип для быстрой записи (главная) |

### `settings/*` — тема, часовой пояс, данные, аналитика

| `goalId` | Когда срабатывает |
|----------|-------------------|
| `settings/theme/change` | Смена темы (параметр `preference`: system / light / dark) |
| `settings/timezone/change` | Смена режима часового пояса: явная зона (`is_auto: 0`, `timezone`) или возврат к авто (`is_auto: 1`) |
| `settings/data/clear_indexed_db` | Подтверждено удаление данных тренировок (IndexedDB) |
| `settings/data/clear_local_preferences` | Сброшены настройки интерфейса (localStorage), таймзона к авто |
| `settings/data/clear_all` | Очистка данных и настроек целиком |
| `settings/analytics/toggle` | Переключатель анонимной статистики (`enabled`: 1 или 0) |

## Параметры (сводка)

| Цель | Параметры |
|------|-----------|
| `exercise/set_logged`, `exercise/remove` | `reps`, опционально `exercise_name` |
| `exercise/create`, `exercise/edit`, архив / разархив | `name` |
| `exercise/goal_set` | `target_reps_per_day` |
| `exercise/preferred_change` | опционально `exercise_name` |
| `settings/theme/change` | `preference` |
| `settings/timezone/change` | `is_auto` (1 — авто; 0 — явная зона), при 0 — `timezone` |
| `settings/analytics/toggle` | `enabled` |

Строки обрезаются до ~100 символов в [`pushlog-analytics.ts`](../src/shared/lib/pushlog-analytics.ts).

## UI

Экран настроек: переключатель отправки статистики — [`SettingsScreen`](../src/widgets/settings-screen/ui/SettingsScreen.tsx).
