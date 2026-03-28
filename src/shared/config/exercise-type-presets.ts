import { firstGrapheme } from "@/shared/lib/first-grapheme";
import type { PersistedExerciseType } from "@/shared/lib/storage/schema";

export const EXERCISE_TYPE_ROW_VERSION = 2;

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
	"bike",
	"footprints",
	"waves",
	"timer",
	"medal",
	"mountain",
	"award",
	"star",
	"sparkles",
	"music",
	"coffee",
	"trophy",
] as const;

export type ExerciseIconPresetKey = (typeof EXERCISE_ICON_PRESET_KEYS)[number];

const ICON_SET = new Set<string>(EXERCISE_ICON_PRESET_KEYS);

export function isValidExerciseIconKey(key: string): key is ExerciseIconPresetKey {
	return ICON_SET.has(key);
}

/**
 * Готовые цвета пресета (hex). Единственный источник для UI-кнопок и резолва в `colorKind: "preset"`.
 */
export const EXERCISE_COLOR_PRESET_HEX = ["#e11d48", "#2563eb", "#16a34a", "#ca8a04", "#9333ea", "#ea580c"] as const;

export type ExerciseColorPresetKey = (typeof EXERCISE_COLOR_PRESET_HEX)[number];

const PRESET_HEX_SET = new Set<string>(EXERCISE_COLOR_PRESET_HEX);

export function isValidExerciseColorPreset(value: string): boolean {
	return PRESET_HEX_SET.has(value);
}

export function resolvePresetColorValueToHex(value: string): ExerciseColorPresetKey {
	if (PRESET_HEX_SET.has(value)) return value as ExerciseColorPresetKey;
	return EXERCISE_COLOR_PRESET_HEX[0];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isExerciseTypeUuid(id: string): boolean {
	return UUID_RE.test(id);
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidCustomExerciseColor(hex: string): boolean {
	return HEX_COLOR_RE.test(hex);
}

export type ExerciseTypeIconVisual = Pick<
	PersistedExerciseType,
	"iconDisplay" | "iconKey" | "iconEmojiText" | "nameInitialGlyph"
>;

export function lucideIconVisual(iconKey: string): ExerciseTypeIconVisual {
	return {
		iconDisplay: "lucide",
		iconKey: isValidExerciseIconKey(iconKey) ? iconKey : "activity",
		iconEmojiText: "",
		nameInitialGlyph: "",
	};
}

export function pickExerciseTypeIconVisual(
	et: Pick<PersistedExerciseType, "iconDisplay" | "iconKey" | "iconEmojiText" | "nameInitialGlyph">,
): ExerciseTypeIconVisual {
	return {
		iconDisplay: et.iconDisplay === "text" ? "text" : "lucide",
		iconKey: et.iconKey,
		iconEmojiText: et.iconEmojiText ?? "",
		nameInitialGlyph: et.nameInitialGlyph ?? "",
	};
}

export function createDefaultSeedExerciseType(now: string): PersistedExerciseType {
	const id = crypto.randomUUID();
	const name = "Отжимания";
	return {
		id,
		name,
		iconDisplay: "lucide",
		iconKey: "dumbbell",
		iconEmojiText: "",
		nameInitialGlyph: firstGrapheme(name),
		colorKind: "preset",
		colorValue: EXERCISE_COLOR_PRESET_HEX[0],
		archivedAt: null,
		createdAt: now,
		updatedAt: now,
		version: EXERCISE_TYPE_ROW_VERSION,
	};
}

/** CSS color для графиков и акцентов (всегда конкретное значение, без var). */
export function resolveExerciseTypeColor(et: Pick<PersistedExerciseType, "colorKind" | "colorValue">): string {
	if (et.colorKind === "custom" && isValidCustomExerciseColor(et.colorValue)) {
		return et.colorValue;
	}
	if (et.colorKind === "preset" && isValidExerciseColorPreset(et.colorValue)) {
		return resolvePresetColorValueToHex(et.colorValue);
	}
	return EXERCISE_COLOR_PRESET_HEX[0];
}
