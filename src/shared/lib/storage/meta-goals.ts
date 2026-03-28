import type { PersistedGoal } from "./schema";

/** Строка meta в IndexedDB (внутренний формат адаптера). */
export type MetaRowGoals = {
	key: string;
	schemaVersion: number;
	/** Устаревшее поле; переносится в `goalsByExerciseTypeId`. */
	goal?: PersistedGoal;
	goalsByExerciseTypeId?: Record<string, PersistedGoal>;
};

export function normalizeGoalsFromMeta(meta: MetaRowGoals): Record<string, PersistedGoal> {
	if (meta.goalsByExerciseTypeId && Object.keys(meta.goalsByExerciseTypeId).length > 0) {
		return { ...meta.goalsByExerciseTypeId };
	}
	if (meta.goal) {
		return { [meta.goal.exerciseTypeId]: meta.goal };
	}
	return {};
}

export function metaRowWithoutLegacyGoal(meta: MetaRowGoals, goals: Record<string, PersistedGoal>): MetaRowGoals {
	const next: MetaRowGoals = {
		key: meta.key,
		schemaVersion: meta.schemaVersion,
	};
	if (Object.keys(goals).length > 0) {
		next.goalsByExerciseTypeId = goals;
	}
	return next;
}
