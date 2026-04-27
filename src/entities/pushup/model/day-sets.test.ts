import { describe, expect, test } from "vitest";
import {
	filterSetsByDayKey,
	filterSetsByExerciseTypeId,
	orderedRepsBreakdownForDay,
	sortSetsByCreatedAtAsc,
	totalRepsForDayAndExercise,
} from "./day-sets";
import type { PushlogSet } from "./types";

const sets: PushlogSet[] = [
	{
		id: "s1",
		exerciseTypeId: "push",
		reps: 12,
		createdAt: "2026-01-01T10:00:00.000Z",
		dayKey: "2026-01-01",
		version: 2,
	},
	{
		id: "s2",
		exerciseTypeId: "push",
		reps: 8,
		createdAt: "2026-01-01T09:00:00.000Z",
		dayKey: "2026-01-01",
		version: 2,
	},
	{
		id: "s3",
		exerciseTypeId: "dips",
		reps: 10,
		createdAt: "2026-01-01T11:00:00.000Z",
		dayKey: "2026-01-01",
		version: 2,
	},
	{
		id: "s4",
		exerciseTypeId: "dips",
		reps: 6,
		createdAt: "2026-01-02T11:00:00.000Z",
		dayKey: "2026-01-02",
		version: 2,
	},
];

describe("day-sets helpers", () => {
	test("filters by day key and exercise type", () => {
		expect(filterSetsByDayKey(sets, "2026-01-01").map((x) => x.id)).toEqual(["s1", "s2", "s3"]);
		expect(filterSetsByExerciseTypeId(sets, "dips").map((x) => x.id)).toEqual(["s3", "s4"]);
	});

	test("computes total reps for day and exercise", () => {
		expect(totalRepsForDayAndExercise(sets, "2026-01-01", "push")).toBe(20);
		expect(totalRepsForDayAndExercise(sets, "2026-01-02", "push")).toBe(0);
	});

	test("orders day breakdown by descending reps", () => {
		expect(orderedRepsBreakdownForDay(sets, "2026-01-01")).toEqual([
			{ exerciseTypeId: "push", reps: 20 },
			{ exerciseTypeId: "dips", reps: 10 },
		]);
	});

	test("sorts by createdAt ascending", () => {
		expect(sortSetsByCreatedAtAsc(sets).map((x) => x.id)).toEqual(["s2", "s1", "s3", "s4"]);
	});
});
