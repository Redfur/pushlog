import { describe, expect, test } from "vitest";
import { normalizeExerciseTypeRow } from "./normalize-exercise-type-row";

describe("normalizeExerciseTypeRow", () => {
	test("normalizes text icon with empty emoji to first grapheme", () => {
		const row = normalizeExerciseTypeRow({
			id: "et1",
			name: "Отжимания",
			iconDisplay: "text",
			iconKey: "activity",
			iconEmojiText: "",
			nameInitialGlyph: "",
			colorKind: "preset",
			colorValue: "#e11d48",
			archivedAt: null,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
			version: 1,
		});

		expect(row.iconDisplay).toBe("text");
		expect(row.nameInitialGlyph).toBe("О");
		expect(row.trackWeightInSets).toBe(false);
	});

	test("forces lucide mode for unknown iconDisplay", () => {
		const row = normalizeExerciseTypeRow({
			id: "et1",
			name: "Push-ups",
			iconDisplay: "bad" as "lucide",
			iconKey: "activity",
			iconEmojiText: "💪",
			nameInitialGlyph: "",
			colorKind: "preset",
			colorValue: "#e11d48",
			archivedAt: null,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
			version: 1,
		});

		expect(row.iconDisplay).toBe("lucide");
		expect(row.nameInitialGlyph).toBe("P");
	});
});
