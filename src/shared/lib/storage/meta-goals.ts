import type { PersistedGoal } from "./schema";

/** Строка meta в IndexedDB (внутренний формат адаптера). */
export type MetaRowGoals = {
	key: string;
	schemaVersion: number;
	goalsByExerciseTypeId?: Record<string, PersistedGoal>;
};

export function goalsFromMeta(meta: MetaRowGoals): Record<string, PersistedGoal> {
	if (!meta.goalsByExerciseTypeId) return {};
	return { ...meta.goalsByExerciseTypeId };
}

export function buildMetaRow(
	meta: Pick<MetaRowGoals, "key" | "schemaVersion">,
	goals: Record<string, PersistedGoal>,
): MetaRowGoals {
	const next: MetaRowGoals = {
		key: meta.key,
		schemaVersion: meta.schemaVersion,
	};
	if (Object.keys(goals).length > 0) {
		next.goalsByExerciseTypeId = goals;
	}
	return next;
}
