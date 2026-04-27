import { describe, expect, test } from "vitest";
import { computeStats } from "./compute-stats";
import type { PushlogSet } from "./types";

function setRow(
	input: Partial<PushlogSet> & Pick<PushlogSet, "id" | "dayKey" | "reps" | "exerciseTypeId">,
): PushlogSet {
	return {
		createdAt: "2026-01-01T10:00:00.000Z",
		version: 2,
		...input,
	};
}

describe("computeStats", () => {
	test("returns zeroed stats for empty list", () => {
		expect(computeStats([], "2026-01-05", "UTC")).toEqual({
			totalRepsAllTime: 0,
			totalSetsAllTime: 0,
			activeDaysCount: 0,
			averageRepsPerActiveDay: null,
			bestDay: null,
			currentStreak: 0,
		});
	});

	test("aggregates totals and picks lexicographically earliest day on best-day tie", () => {
		const sets: PushlogSet[] = [
			setRow({ id: "s1", exerciseTypeId: "push", dayKey: "2026-01-01", reps: 10 }),
			setRow({ id: "s2", exerciseTypeId: "push", dayKey: "2026-01-02", reps: 5 }),
			setRow({ id: "s3", exerciseTypeId: "dips", dayKey: "2026-01-02", reps: 5 }),
			setRow({ id: "s4", exerciseTypeId: "push", dayKey: "2026-01-03", reps: 8 }),
			setRow({ id: "s5", exerciseTypeId: "dips", dayKey: "2026-01-03", reps: 2 }),
		];

		expect(computeStats(sets, "2026-01-03", "UTC")).toEqual({
			totalRepsAllTime: 30,
			totalSetsAllTime: 5,
			activeDaysCount: 3,
			averageRepsPerActiveDay: 10,
			bestDay: { dayKey: "2026-01-01", totalReps: 10 },
			currentStreak: 3,
		});
	});

	test("returns streak zero when today has no sets", () => {
		const sets: PushlogSet[] = [
			setRow({ id: "s1", exerciseTypeId: "push", dayKey: "2026-01-01", reps: 10 }),
			setRow({ id: "s2", exerciseTypeId: "push", dayKey: "2026-01-02", reps: 12 }),
		];

		expect(computeStats(sets, "2026-01-03", "UTC").currentStreak).toBe(0);
	});
});
