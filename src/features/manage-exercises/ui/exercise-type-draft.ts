import {
	EXERCISE_COLOR_PRESET_HEX,
	isValidCustomExerciseColor,
	isValidExerciseColorPreset,
	isValidExerciseIconKey,
	resolvePresetColorValueToHex,
} from "@/shared/config/exercise-type-presets";
import { firstGrapheme } from "@/shared/lib/first-grapheme";
import type { ExerciseIconDisplay, PersistedExerciseType } from "@/shared/lib/storage/schema";

export type ExerciseTypeDraft = {
	name: string;
	iconDisplay: ExerciseIconDisplay;
	iconKey: string;
	iconEmojiText: string;
	colorKind: "preset" | "custom";
	colorValue: string;
	trackWeightInSets: boolean;
};

export function defaultExerciseTypeDraft(): ExerciseTypeDraft {
	return {
		name: "",
		iconDisplay: "lucide",
		iconKey: "chevrons-up",
		iconEmojiText: "",
		colorKind: "preset",
		colorValue: EXERCISE_COLOR_PRESET_HEX[0],
		trackWeightInSets: false,
	};
}

export function exerciseTypeDraftFromPersisted(et: PersistedExerciseType): ExerciseTypeDraft {
	return {
		name: et.name,
		iconDisplay: et.iconDisplay,
		iconKey: et.iconKey,
		iconEmojiText: et.iconEmojiText,
		colorKind: et.colorKind,
		colorValue:
			et.colorKind === "preset" && isValidExerciseColorPreset(et.colorValue)
				? resolvePresetColorValueToHex(et.colorValue)
				: et.colorValue,
		trackWeightInSets: et.trackWeightInSets,
	};
}

type NormalizedExerciseTypeSave = {
	name: string;
	iconDisplay: ExerciseIconDisplay;
	iconKey: string;
	iconEmojiText: string;
	nameInitialGlyph: string;
	colorKind: "preset" | "custom";
	colorValue: string;
	trackWeightInSets: boolean;
};

/** Превью значка в форме до сохранения (буква из названия при пустом emoji). */
export function draftIconPreviewVisual(
	draft: ExerciseTypeDraft,
): Pick<PersistedExerciseType, "iconDisplay" | "iconKey" | "iconEmojiText" | "nameInitialGlyph"> {
	const nameFirst = firstGrapheme(draft.name);
	if (draft.iconDisplay === "text") {
		return {
			iconDisplay: "text",
			iconKey: draft.iconKey,
			iconEmojiText: draft.iconEmojiText,
			nameInitialGlyph: nameFirst,
		};
	}
	return {
		iconDisplay: "lucide",
		iconKey: isValidExerciseIconKey(draft.iconKey) ? draft.iconKey : "activity",
		iconEmojiText: "",
		nameInitialGlyph: nameFirst,
	};
}

/** `error === null` — пустое имя (вызывающий код молча выходит). Иначе — текст ошибки (например HEX). */
export function normalizeExerciseTypeDraft(
	draft: ExerciseTypeDraft,
	hexInvalidMessage: string,
): { ok: true; value: NormalizedExerciseTypeSave } | { ok: false; error: string | null } {
	const name = draft.name.trim();
	if (!name) return { ok: false, error: null };

	const iconDisplay: ExerciseIconDisplay = draft.iconDisplay === "text" ? "text" : "lucide";
	const iconEmojiTextTrimmed = draft.iconEmojiText.trim();
	const nameInitialGlyph = firstGrapheme(name);

	const iconKey = isValidExerciseIconKey(draft.iconKey) ? draft.iconKey : "activity";

	const colorKind = draft.colorKind;
	let colorValue = draft.colorValue.trim();
	if (colorKind === "custom") {
		if (!colorValue.startsWith("#")) colorValue = `#${colorValue}`;
		if (!isValidCustomExerciseColor(colorValue)) {
			return { ok: false, error: hexInvalidMessage };
		}
	} else if (!isValidExerciseColorPreset(colorValue)) {
		colorValue = EXERCISE_COLOR_PRESET_HEX[0];
	} else {
		colorValue = resolvePresetColorValueToHex(colorValue);
	}

	return {
		ok: true,
		value: {
			name,
			iconDisplay,
			iconKey,
			iconEmojiText: iconDisplay === "text" ? iconEmojiTextTrimmed : "",
			nameInitialGlyph,
			colorKind,
			colorValue,
			trackWeightInSets: draft.trackWeightInSets,
		},
	};
}
