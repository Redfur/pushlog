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

/** Каталог упражнений (UUID); имя и оформление задаёт пользователь. */
export type PersistedExerciseType = {
	id: string;
	name: string;
	iconKey: string;
	colorKind: "preset" | "custom";
	/** preset: `chart-1`…`chart-5`; custom: `#rrggbb` */
	colorValue: string;
	archivedAt: string | null;
	createdAt: string;
	updatedAt: string;
	version: number;
};
