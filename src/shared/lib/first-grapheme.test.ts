import { describe, expect, test } from "vitest";
import { firstGrapheme } from "./first-grapheme";

describe("first-grapheme", () => {
	test("extracts first grapheme from simple text", () => {
		expect(firstGrapheme("Push-ups")).toBe("P");
		expect(firstGrapheme("Отжимания")).toBe("О");
		expect(firstGrapheme("123")).toBe("1");
	});

	test("handles emoji and complex graphemes", () => {
		expect(firstGrapheme("💪 Strong")).toBe("💪");
		expect(firstGrapheme("👨‍👩‍👧‍👦 Family")).toBe("👨‍👩‍👧‍👦");
		expect(firstGrapheme("🏋️‍♂️ Lift")).toBe("🏋️‍♂️");
	});

	test("trims whitespace before extraction", () => {
		expect(firstGrapheme("  Push")).toBe("P");
		expect(firstGrapheme("\t\nBench")).toBe("B");
	});

	test("returns empty string for empty or whitespace-only input", () => {
		expect(firstGrapheme("")).toBe("");
		expect(firstGrapheme("   ")).toBe("");
		expect(firstGrapheme("\t\n")).toBe("");
	});

	test("falls back to array spread if Intl.Segmenter fails", () => {
		const originalSegmenter = Intl.Segmenter;
		(Intl as { Segmenter?: unknown }).Segmenter = undefined;

		expect(firstGrapheme("Test")).toBe("T");
		expect(firstGrapheme("Тест")).toBe("Т");

		(Intl as { Segmenter?: unknown }).Segmenter = originalSegmenter;
	});
});
