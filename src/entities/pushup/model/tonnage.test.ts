import { describe, expect, test } from "vitest";
import {
	buildDailyTonnageSeries,
	totalTonnageForDayKey,
	totalTonnageForDayKeys,
	totalTonnageForExerciseType,
} from "./tonnage";
import type { PushlogSet } from "./types";

function setRow(
	input: Partial<PushlogSet> & Pick<PushlogSet, "id" | "dayKey" | "exerciseTypeId" | "reps">,
): PushlogSet {
	return {
		createdAt: "2026-01-01T10:00:00.000Z",
		version: 2,
		...input,
	};
}

describe("tonnage", () => {
	const sets: PushlogSet[] = [
		setRow({ id: "s1", dayKey: "2026-01-01", exerciseTypeId: "a", reps: 10, weightValue: 20 }),
		setRow({ id: "s2", dayKey: "2026-01-01", exerciseTypeId: "a", reps: 5, weightValue: 22.22 }),
		setRow({ id: "s3", dayKey: "2026-01-02", exerciseTypeId: "a", reps: 8, weightValue: 30 }),
		setRow({ id: "s4", dayKey: "2026-01-02", exerciseTypeId: "b", reps: 12 }),
		setRow({ id: "s5", dayKey: "2026-01-03", exerciseTypeId: "b", reps: 6, weightValue: 0 }),
	];

	test("sums day tonnage and rounds to 2 decimals", () => {
		expect(totalTonnageForDayKey(sets, "2026-01-01")).toBe(311.1);
		expect(totalTonnageForDayKey(sets, "2026-01-02")).toBe(240);
	});

	test("sums tonnage by day key set", () => {
		expect(totalTonnageForDayKeys(sets, ["2026-01-01", "2026-01-03"])).toBe(311.1);
		expect(totalTonnageForDayKeys(sets, ["2026-01-01", "2026-01-02"])).toBe(551.1);
	});

	test("sums tonnage for specific exercise only", () => {
		expect(totalTonnageForExerciseType(sets, "a")).toBe(551.1);
		expect(totalTonnageForExerciseType(sets, "b")).toBe(0);
	});

	test("builds day series including zero days", () => {
		expect(buildDailyTonnageSeries(sets, ["2026-01-01", "2026-01-02", "2026-01-04"])).toEqual([
			{ dayKey: "2026-01-01", tonnage: 311.1 },
			{ dayKey: "2026-01-02", tonnage: 240 },
			{ dayKey: "2026-01-04", tonnage: 0 },
		]);
	});
});
