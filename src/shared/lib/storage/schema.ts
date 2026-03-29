/**
 * Форма записи в IndexedDB (доменное имя в entities — PushlogSet).
 * Слой shared не импортирует entities.
 */
export type PersistedSet = {
	id: string;
	exerciseTypeId: string;
	reps: number;
	/** Кг; только для упражнений с `trackWeightInSets` у типа. */
	weightValue?: number | null;
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

/** Как показывать значок: пресет Lucide или текст (emoji / буква из БД). */
export type ExerciseIconDisplay = "lucide" | "text";

/** Каталог упражнений (UUID); имя и оформление задаёт пользователь. */
export type PersistedExerciseType = {
	id: string;
	name: string;
	iconDisplay: ExerciseIconDisplay;
	iconKey: string;
	/** Режим `text`: введённый emoji/текст; пусто — показываем `nameInitialGlyph`. */
	iconEmojiText: string;
	/** Сохранённая первая графема названия (обновляется при сохранении, если emoji пустой). */
	nameInitialGlyph: string;
	colorKind: "preset" | "custom";
	/** preset: hex из `EXERCISE_COLOR_PRESET_HEX`; custom: `#rrggbb` */
	colorValue: string;
	/** При true в каждом подходе вводится вес (кг) вместе с повторениями. */
	trackWeightInSets: boolean;
	archivedAt: string | null;
	createdAt: string;
	updatedAt: string;
	version: number;
};
