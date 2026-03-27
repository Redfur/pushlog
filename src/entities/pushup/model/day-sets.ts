import type { PushlogSet } from "./types";

export function filterSetsByDayKey(sets: PushlogSet[], dayKey: string): PushlogSet[] {
	return sets.filter((s) => s.dayKey === dayKey);
}

export function sortSetsByCreatedAtAsc(sets: PushlogSet[]): PushlogSet[] {
	return [...sets].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function totalRepsForDay(sets: PushlogSet[], dayKey: string): number {
	return filterSetsByDayKey(sets, dayKey).reduce((sum, s) => sum + s.reps, 0);
}
