import type { DayKey } from "@/shared/lib/day-key";
import type { PushlogSet } from "./types";

export function filterSetsByDayKey(sets: PushlogSet[], dayKey: string): PushlogSet[] {
	return sets.filter((s) => s.dayKey === dayKey);
}

export function filterSetsByExerciseTypeId(sets: PushlogSet[], exerciseTypeId: string): PushlogSet[] {
	return sets.filter((s) => s.exerciseTypeId === exerciseTypeId);
}

/** Сумма повторений за день только для указанного типа. */
export function totalRepsForDayAndExercise(sets: PushlogSet[], dayKey: DayKey, exerciseTypeId: string): number {
	return filterSetsByDayKey(sets, dayKey)
		.filter((s) => s.exerciseTypeId === exerciseTypeId)
		.reduce((sum, s) => sum + s.reps, 0);
}

/** Повторения за календарный день по каждому `exerciseTypeId`. */
function repsByExerciseTypeForDay(sets: PushlogSet[], dayKey: DayKey): Map<string, number> {
	const m = new Map<string, number>();
	for (const s of sets) {
		if (s.dayKey !== dayKey) continue;
		m.set(s.exerciseTypeId, (m.get(s.exerciseTypeId) ?? 0) + s.reps);
	}
	return m;
}

/** Разбивка по типам за день для подсказок (по убыванию повторов). */
export function orderedRepsBreakdownForDay(
	sets: PushlogSet[],
	dayKey: DayKey,
): { exerciseTypeId: string; reps: number }[] {
	const m = repsByExerciseTypeForDay(sets, dayKey);
	return [...m.entries()]
		.filter(([, reps]) => reps > 0)
		.sort((a, b) => b[1] - a[1])
		.map(([exerciseTypeId, reps]) => ({ exerciseTypeId, reps }));
}

export function sortSetsByCreatedAtAsc(sets: PushlogSet[]): PushlogSet[] {
	return [...sets].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
