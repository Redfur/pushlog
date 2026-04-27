import { describe, expect, test } from "vitest";
import { computeStatsForExerciseType } from "./compute-stats-by-exercise";
import type { PushlogSet } from "./types";

const sets: PushlogSet[] = [
	{
		id: "s1",
		exerciseTypeId: "push",
		reps: 10,
		createdAt: "2026-01-01T10:00:00.000Z",
		dayKey: "2026-01-01",
		version: 2,
	},
	{
		id: "s2",
		exerciseTypeId: "dips",
		reps: 20,
		createdAt: "2026-01-02T10:00:00.000Z",
		dayKey: "2026-01-02",
		version: 2,
	},
	{
		id: "s3",
		exerciseTypeId: "push",
		reps: 15,
		createdAt: "2026-01-02T12:00:00.000Z",
		dayKey: "2026-01-02",
		version: 2,
	},
];

describe("computeStatsForExerciseType", () => {
	test("computes stats only for selected exercise", () => {
		expect(computeStatsForExerciseType(sets, "push", "2026-01-02", "UTC")).toEqual({
			totalRepsAllTime: 25,
			totalSetsAllTime: 2,
			activeDaysCount: 2,
			averageRepsPerActiveDay: 12.5,
			bestDay: { dayKey: "2026-01-02", totalReps: 15 },
			currentStreak: 2,
		});
	});
});
