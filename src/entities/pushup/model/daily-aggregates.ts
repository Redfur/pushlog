import type { DayKey } from "@/shared/lib/day-key";
import { dayKeyFromDate, offsetDayKey } from "@/shared/lib/day-key";
import type { PushlogSet } from "./types";

/** Одна точка ряда: календарный день и суммы за него. */
type DailyActivity = {
	dayKey: DayKey;
	reps: number;
	setCount: number;
};

/** Все дни от `fromDayKey` до `toDayKey` включительно (порядок по календарю). */
function enumerateDayKeysInclusive(fromDayKey: DayKey, toDayKey: DayKey, timeZone: string): DayKey[] {
	if (fromDayKey > toDayKey) return [];
	const out: DayKey[] = [];
	let cur = fromDayKey;
	while (cur <= toDayKey) {
		out.push(cur);
		cur = offsetDayKey(cur, 1, timeZone);
	}
	return out;
}

/** Последние `n` календарных дней, заканчивая `endDayKey` (включительно). */
export function lastNDaysInclusive(endDayKey: DayKey, n: number, timeZone: string): DayKey[] {
	if (n <= 0) return [];
	const start = offsetDayKey(endDayKey, -(n - 1), timeZone);
	return enumerateDayKeysInclusive(start, endDayKey, timeZone);
}

function aggregateSetsIntoMap(sets: PushlogSet[]): Map<string, { reps: number; setCount: number }> {
	const map = new Map<string, { reps: number; setCount: number }>();
	for (const s of sets) {
		const cur = map.get(s.dayKey) ?? { reps: 0, setCount: 0 };
		cur.reps += s.reps;
		cur.setCount += 1;
		map.set(s.dayKey, cur);
	}
	return map;
}

/** Для каждого `dayKey` из списка — суммы повторений и число подходов (0 если пусто). */
export function buildDailyActivitySeries(sets: PushlogSet[], dayKeys: DayKey[]): DailyActivity[] {
	const map = aggregateSetsIntoMap(sets);
	return dayKeys.map((dayKey) => ({
		dayKey,
		reps: map.get(dayKey)?.reps ?? 0,
		setCount: map.get(dayKey)?.setCount ?? 0,
	}));
}

const WEEKDAY_TO_MON0: Record<string, number> = {
	Monday: 0,
	Tuesday: 1,
	Wednesday: 2,
	Thursday: 3,
	Friday: 4,
	Saturday: 5,
	Sunday: 6,
};

/**
 * День недели для календарного `dayKey` в `timeZone`: 0 = понедельник, 6 = воскресенье.
 */
function weekdayMonday0(dayKey: DayKey, timeZone: string): number {
	const [y, m, d] = dayKey.split("-").map(Number);
	let utc = Date.UTC(y, m - 1, d, 12, 0, 0);
	if (dayKeyFromDate(new Date(utc), timeZone) !== dayKey) {
		for (const h of [0, 6, 18, 23]) {
			utc = Date.UTC(y, m - 1, d, h, 0, 0);
			if (dayKeyFromDate(new Date(utc), timeZone) === dayKey) break;
		}
	}
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		weekday: "long",
	}).formatToParts(new Date(utc));
	const name = parts.find((p) => p.type === "weekday")?.value;
	return name !== undefined && name in WEEKDAY_TO_MON0 ? WEEKDAY_TO_MON0[name] : 0;
}

/** Понедельник той же недели, что и `dayKey` (в `timeZone`). */
function mondayOfWeekContaining(dayKey: DayKey, timeZone: string): DayKey {
	let d = dayKey;
	for (let i = 0; i < 7; i++) {
		if (weekdayMonday0(d, timeZone) === 0) return d;
		d = offsetDayKey(d, -1, timeZone);
	}
	return dayKey;
}

type HeatmapCell = {
	dayKey: DayKey | null;
	reps: number;
	weekIndex: number;
	weekdayIndex: number;
};

const DEFAULT_HEATMAP_WEEKS = 26;

/**
 * Сетка «недели × дни недели»: `weekIndex` 0 — самая старая колонка, последняя — текущая неделя.
 * Ячейки после `todayKey` — `dayKey: null`, `reps: 0`.
 */
export function buildHeatmapGrid(
	sets: PushlogSet[],
	todayKey: DayKey,
	timeZone: string,
	weeks = DEFAULT_HEATMAP_WEEKS,
): HeatmapCell[] {
	const map = aggregateSetsIntoMap(sets);
	const mondayThisWeek = mondayOfWeekContaining(todayKey, timeZone);
	const gridStartMonday = offsetDayKey(mondayThisWeek, -(weeks - 1) * 7, timeZone);
	const cells: HeatmapCell[] = [];

	for (let w = 0; w < weeks; w++) {
		for (let wd = 0; wd < 7; wd++) {
			const dayKey = offsetDayKey(gridStartMonday, w * 7 + wd, timeZone);
			if (dayKey > todayKey) {
				cells.push({ dayKey: null, reps: 0, weekIndex: w, weekdayIndex: wd });
			} else {
				const reps = map.get(dayKey)?.reps ?? 0;
				cells.push({ dayKey, reps, weekIndex: w, weekdayIndex: wd });
			}
		}
	}
	return cells;
}
