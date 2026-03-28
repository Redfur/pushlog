import {
	isValidCustomExerciseColor,
	isValidExerciseColorPreset,
	isValidExerciseIconKey,
} from "@/shared/config/exercise-type-presets";
import type { PersistedExerciseType } from "@/shared/lib/storage/schema";

export type ExerciseTypeDraft = {
	name: string;
	iconKey: string;
	colorKind: "preset" | "custom";
	colorValue: string;
};

export function defaultExerciseTypeDraft(): ExerciseTypeDraft {
	return {
		name: "",
		iconKey: "dumbbell",
		colorKind: "preset",
		colorValue: "chart-1",
	};
}

export function exerciseTypeDraftFromPersisted(et: PersistedExerciseType): ExerciseTypeDraft {
	return {
		name: et.name,
		iconKey: et.iconKey,
		colorKind: et.colorKind,
		colorValue: et.colorValue,
	};
}

export type NormalizedExerciseTypeSave = {
	name: string;
	iconKey: string;
	colorKind: "preset" | "custom";
	colorValue: string;
};

/** `error === null` — пустое имя (вызывающий код молча выходит). Иначе — текст ошибки (например HEX). */
export function normalizeExerciseTypeDraft(
	draft: ExerciseTypeDraft,
	hexInvalidMessage: string,
): { ok: true; value: NormalizedExerciseTypeSave } | { ok: false; error: string | null } {
	const name = draft.name.trim();
	if (!name) return { ok: false, error: null };
	const iconKey = isValidExerciseIconKey(draft.iconKey) ? draft.iconKey : "activity";
	const colorKind = draft.colorKind;
	let colorValue = draft.colorValue.trim();
	if (colorKind === "custom") {
		if (!colorValue.startsWith("#")) colorValue = `#${colorValue}`;
		if (!isValidCustomExerciseColor(colorValue)) {
			return { ok: false, error: hexInvalidMessage };
		}
	} else if (!isValidExerciseColorPreset(colorValue)) {
		colorValue = "chart-1";
	}
	return { ok: true, value: { name, iconKey, colorKind, colorValue } };
}
