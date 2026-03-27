import type { DayKey } from "@/shared/lib/day-key";
import { computeStreak } from "./compute-streak";
import type { PushlogSet, Stats } from "./types";

export function computeStats(sets: PushlogSet[], todayDayKey: DayKey, timeZone: string): Stats {
	if (sets.length === 0) {
		return {
			totalRepsAllTime: 0,
			totalSetsAllTime: 0,
			activeDaysCount: 0,
			averageRepsPerActiveDay: null,
			bestDay: null,
			currentStreak: 0,
		};
	}

	const totalRepsAllTime = sets.reduce((s, x) => s + x.reps, 0);
	const totalSetsAllTime = sets.length;

	const byDay = new Map<string, number>();
	for (const row of sets) {
		byDay.set(row.dayKey, (byDay.get(row.dayKey) ?? 0) + row.reps);
	}

	const activeDaysCount = byDay.size;
	const averageRepsPerActiveDay = activeDaysCount > 0 ? totalRepsAllTime / activeDaysCount : null;

	let bestDay: { dayKey: string; totalReps: number } | null = null;
	for (const [dayKey, totalReps] of byDay) {
		if (!bestDay || totalReps > bestDay.totalReps) {
			bestDay = { dayKey, totalReps };
		} else if (bestDay && totalReps === bestDay.totalReps && dayKey < bestDay.dayKey) {
			bestDay = { dayKey, totalReps };
		}
	}

	return {
		totalRepsAllTime,
		totalSetsAllTime,
		activeDaysCount,
		averageRepsPerActiveDay,
		bestDay,
		currentStreak: computeStreak(sets, todayDayKey, timeZone),
	};
}
