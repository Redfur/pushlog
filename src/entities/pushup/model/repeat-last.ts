import { DEFAULT_EXERCISE_TYPE_ID } from "@/shared/config/pushlog";
import type { DayKey } from "@/shared/lib/day-key";
import { sortSetsByCreatedAtAsc } from "./day-sets";
import type { PushlogSet } from "./types";

/** Повторить последний подход: сначала последний за сегодня, иначе последний в истории для типа по умолчанию. */
export function getRepeatLastReps(sets: PushlogSet[], todayDayKey: DayKey): number | null {
	const forType = sets.filter((s) => s.exerciseTypeId === DEFAULT_EXERCISE_TYPE_ID);
	const todaySets = forType.filter((s) => s.dayKey === todayDayKey);
	if (todaySets.length > 0) {
		const sorted = sortSetsByCreatedAtAsc(todaySets);
		return sorted[sorted.length - 1].reps;
	}
	if (forType.length === 0) return null;
	const sorted = [...forType].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	return sorted[0].reps;
}
