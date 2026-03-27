import type { PersistedGoal, PersistedSet } from "@/shared/lib/storage";

/** Подход (отжимания и др.); совпадает с формой в IndexedDB. */
export type PushlogSet = PersistedSet;

export type Goal = PersistedGoal;

export type Stats = {
	totalRepsAllTime: number;
	totalSetsAllTime: number;
	activeDaysCount: number;
	averageRepsPerActiveDay: number | null;
	bestDay: { dayKey: string; totalReps: number } | null;
	currentStreak: number;
};
