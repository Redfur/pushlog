import { describe, expect, test } from "vitest";
import { isValidSetWeightKg, parseWeightDraft, roundWeightKg, SET_WEIGHT_MAX_KG } from "./parse-weight-input";

describe("parse-weight-input", () => {
	test("parses decimal values with dot and comma", () => {
		expect(parseWeightDraft("12.5")).toBe(12.5);
		expect(parseWeightDraft("12,5")).toBe(12.5);
		expect(parseWeightDraft("   ")).toBeNull();
		expect(parseWeightDraft("abc")).toBeNull();
	});

	test("roundWeightKg rounds to two decimals", () => {
		expect(roundWeightKg(10.125)).toBe(10.13);
		expect(roundWeightKg(10.124)).toBe(10.12);
	});

	test("validates allowed storage range", () => {
		expect(isValidSetWeightKg(0.01)).toBe(true);
		expect(isValidSetWeightKg(SET_WEIGHT_MAX_KG)).toBe(true);
		expect(isValidSetWeightKg(0)).toBe(false);
		expect(isValidSetWeightKg(SET_WEIGHT_MAX_KG + 0.01)).toBe(false);
	});
});
