import { afterEach, describe, expect, test, vi } from "vitest";
import {
	createDefaultSeedExerciseTypes,
	isExerciseTypeUuid,
	isValidCustomExerciseColor,
	isValidExerciseColorPreset,
	isValidExerciseIconKey,
	lucideIconVisual,
	resolveExerciseTypeColor,
	resolvePresetColorValueToHex,
} from "./exercise-type-presets";

describe("exercise-type-presets", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("validates icon keys and preset colors", () => {
		expect(isValidExerciseIconKey("activity")).toBe(true);
		expect(isValidExerciseIconKey("invalid")).toBe(false);
		expect(isValidExerciseColorPreset("#2563eb")).toBe(true);
		expect(isValidExerciseColorPreset("#000000")).toBe(false);
	});

	test("resolves preset fallback color", () => {
		expect(resolvePresetColorValueToHex("#16a34a")).toBe("#16a34a");
		expect(resolvePresetColorValueToHex("bad")).toBe("#e11d48");
	});

	test("validates custom hex and uuid", () => {
		expect(isValidCustomExerciseColor("#00ffAA")).toBe(true);
		expect(isValidCustomExerciseColor("00ffAA")).toBe(false);
		expect(isExerciseTypeUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
		expect(isExerciseTypeUuid("not-uuid")).toBe(false);
	});

	test("builds lucide icon visual with fallback", () => {
		expect(lucideIconVisual("dumbbell")).toEqual({
			iconDisplay: "lucide",
			iconKey: "dumbbell",
			iconEmojiText: "",
			nameInitialGlyph: "",
		});
		expect(lucideIconVisual("bad").iconKey).toBe("activity");
	});

	test("creates default seed exercise types", () => {
		const randomUUID = vi.fn().mockReturnValueOnce("id-1").mockReturnValueOnce("id-2");
		vi.stubGlobal("crypto", { randomUUID });

		const rows = createDefaultSeedExerciseTypes("2026-01-01T00:00:00.000Z");
		expect(rows).toHaveLength(2);
		expect(rows[0]?.id).toBe("id-1");
		expect(rows[1]?.id).toBe("id-2");
		expect(rows[0]?.trackWeightInSets).toBe(false);
		expect(rows[1]?.trackWeightInSets).toBe(true);
	});

	test("resolves exercise type color with fallbacks", () => {
		expect(resolveExerciseTypeColor({ colorKind: "custom", colorValue: "#123abc" })).toBe("#123abc");
		expect(resolveExerciseTypeColor({ colorKind: "custom", colorValue: "bad" })).toBe("#e11d48");
		expect(resolveExerciseTypeColor({ colorKind: "preset", colorValue: "#2563eb" })).toBe("#2563eb");
		expect(resolveExerciseTypeColor({ colorKind: "preset", colorValue: "bad" })).toBe("#e11d48");
	});
});
