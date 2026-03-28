import type { PersistedExerciseType } from "@/shared/lib/storage/schema";

export const EXERCISE_TYPE_ROW_VERSION = 1;

/** Допустимые ключи иконок (Lucide в UI). */
export const EXERCISE_ICON_PRESET_KEYS = [
	"dumbbell",
	"chevrons-up",
	"activity",
	"zap",
	"flame",
	"target",
	"heart-pulse",
	"person-standing",
] as const;

export type ExerciseIconPresetKey = (typeof EXERCISE_ICON_PRESET_KEYS)[number];

const ICON_SET = new Set<string>(EXERCISE_ICON_PRESET_KEYS);

export function isValidExerciseIconKey(key: string): key is ExerciseIconPresetKey {
	return ICON_SET.has(key);
}

/** Пресеты цвета для графиков (CSS var --color-chart-n). */
export const EXERCISE_COLOR_PRESET_KEYS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] as const;

export type ExerciseColorPresetKey = (typeof EXERCISE_COLOR_PRESET_KEYS)[number];

const COLOR_PRESET_SET = new Set<string>(EXERCISE_COLOR_PRESET_KEYS);

export function isValidExerciseColorPreset(key: string): key is ExerciseColorPresetKey {
	return COLOR_PRESET_SET.has(key);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isExerciseTypeUuid(id: string): boolean {
	return UUID_RE.test(id);
}

/** Легаси `exerciseTypeId` из версии до UUID — дефолты при миграции. */
export const LEGACY_EXERCISE_TYPE_DEFAULTS: Record<
	string,
	{ name: string; iconKey: ExerciseIconPresetKey; colorValue: ExerciseColorPresetKey }
> = {
	"exercise.pushups": { name: "Отжимания", iconKey: "dumbbell", colorValue: "chart-1" },
	"exercise.pullups": { name: "Подтягивания", iconKey: "chevrons-up", colorValue: "chart-2" },
};

export function isLegacyExerciseTypeId(id: string): boolean {
	return id in LEGACY_EXERCISE_TYPE_DEFAULTS;
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidCustomExerciseColor(hex: string): boolean {
	return HEX_COLOR_RE.test(hex);
}

export function createDefaultSeedExerciseType(now: string): PersistedExerciseType {
	const id = crypto.randomUUID();
	return {
		id,
		name: "Отжимания",
		iconKey: "dumbbell",
		colorKind: "preset",
		colorValue: "chart-1",
		archivedAt: null,
		createdAt: now,
		updatedAt: now,
		version: EXERCISE_TYPE_ROW_VERSION,
	};
}

/** CSS color для графиков и акцентов. */
export function resolveExerciseTypeColor(et: Pick<PersistedExerciseType, "colorKind" | "colorValue">): string {
	if (et.colorKind === "custom" && isValidCustomExerciseColor(et.colorValue)) {
		return et.colorValue;
	}
	if (et.colorKind === "preset" && isValidExerciseColorPreset(et.colorValue)) {
		return `var(--color-${et.colorValue})`;
	}
	return "var(--color-chart-1)";
}
