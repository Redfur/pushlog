import { describe, expect, test } from "vitest";
import { parseDailyGoalInput } from "./parse-daily-goal-input";

describe("parseDailyGoalInput", () => {
	test("returns empty for blank input", () => {
		expect(parseDailyGoalInput("")).toEqual({ kind: "empty" });
		expect(parseDailyGoalInput("   ")).toEqual({ kind: "empty" });
	});

	test("accepts positive integer", () => {
		expect(parseDailyGoalInput("12")).toEqual({ kind: "valid", reps: 12 });
		expect(parseDailyGoalInput(" 7 ")).toEqual({ kind: "valid", reps: 7 });
	});

	test("rejects non-positive and non-numeric values", () => {
		expect(parseDailyGoalInput("0")).toEqual({ kind: "invalid" });
		expect(parseDailyGoalInput("-3")).toEqual({ kind: "invalid" });
		expect(parseDailyGoalInput("abc")).toEqual({ kind: "invalid" });
	});
});
