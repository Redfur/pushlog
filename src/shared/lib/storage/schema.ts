/**
 * Форма записи в IndexedDB (доменное имя в entities — PushlogSet).
 * Слой shared не импортирует entities.
 */
export type PersistedSet = {
	id: string;
	exerciseTypeId: string;
	reps: number;
	createdAt: string;
	dayKey: string;
	version: number;
};

export type PersistedGoal = {
	id: string;
	exerciseTypeId: string;
	targetRepsPerDay: number;
	effectiveFrom: string;
	updatedAt: string;
};

export type PersistedMeta = {
	schemaVersion: number;
};
