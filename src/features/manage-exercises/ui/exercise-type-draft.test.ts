import { describe, expect, test } from "vitest";
import {
	defaultExerciseTypeDraft,
	draftIconPreviewVisual,
	exerciseTypeDraftFromPersisted,
	normalizeExerciseTypeDraft,
} from "./exercise-type-draft";

describe("exercise-type-draft", () => {
	test("returns defaults for create form", () => {
		const d = defaultExerciseTypeDraft();
		expect(d.iconDisplay).toBe("lucide");
		expect(d.colorKind).toBe("preset");
		expect(d.dailyGoalInput).toBe("");
	});

	test("maps persisted row to editable draft", () => {
		const draft = exerciseTypeDraftFromPersisted({
			id: "et",
			name: "Push-ups",
			iconDisplay: "text",
			iconKey: "activity",
			iconEmojiText: "💪",
			nameInitialGlyph: "P",
			colorKind: "preset",
			colorValue: "#2563eb",
			trackWeightInSets: true,
			archivedAt: null,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
			version: 1,
		});

		expect(draft.name).toBe("Push-ups");
		expect(draft.colorValue).toBe("#2563eb");
	});

	test("normalizes valid draft with trimmed fields", () => {
		const normalized = normalizeExerciseTypeDraft(
			{
				name: "  Push-ups  ",
				iconDisplay: "text",
				iconKey: "bad",
				iconEmojiText: "  💪  ",
				colorKind: "custom",
				colorValue: "123abc",
				trackWeightInSets: false,
				dailyGoalInput: "",
			},
			"hex-error",
		);

		expect(normalized.ok).toBe(true);
		if (normalized.ok) {
			expect(normalized.value.name).toBe("Push-ups");
			expect(normalized.value.colorValue).toBe("#123abc");
			expect(normalized.value.iconKey).toBe("activity");
			expect(normalized.value.iconEmojiText).toBe("💪");
		}
	});

	test("returns errors for empty name and invalid custom color", () => {
		expect(
			normalizeExerciseTypeDraft(
				{
					...defaultExerciseTypeDraft(),
					name: "   ",
				},
				"hex-error",
			),
		).toEqual({ ok: false, error: null });

		expect(
			normalizeExerciseTypeDraft(
				{
					...defaultExerciseTypeDraft(),
					name: "Bench",
					colorKind: "custom",
					colorValue: "zzzzzz",
				},
				"hex-error",
			),
		).toEqual({ ok: false, error: "hex-error" });
	});

	test("builds icon preview with fallback for invalid lucide key", () => {
		expect(
			draftIconPreviewVisual({
				...defaultExerciseTypeDraft(),
				name: "Rows",
				iconDisplay: "lucide",
				iconKey: "bad",
			}),
		).toEqual({
			iconDisplay: "lucide",
			iconKey: "activity",
			iconEmojiText: "",
			nameInitialGlyph: "R",
		});
	});
});
