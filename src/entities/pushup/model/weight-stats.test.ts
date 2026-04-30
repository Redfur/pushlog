import { describe, expect, test } from "vitest";
import type { PushlogSet } from "./types";
import { buildDailyMaxWeightSeries, maxWeightAllTime } from "./weight-stats";

const sets: PushlogSet[] = [
	{
		id: "s1",
		exerciseTypeId: "a",
		reps: 10,
		weightValue: 20,
		createdAt: "2026-01-01T10:00:00.000Z",
		dayKey: "2026-01-01",
		version: 2,
	},
	{
		id: "s2",
		exerciseTypeId: "a",
		reps: 8,
		weightValue: 22.5,
		createdAt: "2026-01-01T11:00:00.000Z",
		dayKey: "2026-01-01",
		version: 2,
	},
	{
		id: "s3",
		exerciseTypeId: "a",
		reps: 12,
		weightValue: 21,
		createdAt: "2026-01-02T11:00:00.000Z",
		dayKey: "2026-01-02",
		version: 2,
	},
	{
		id: "s4",
		exerciseTypeId: "a",
		reps: 6,
		createdAt: "2026-01-03T11:00:00.000Z",
		dayKey: "2026-01-03",
		version: 2,
	},
];

describe("weight-stats", () => {
	test("finds all-time max weight ignoring absent weight", () => {
		expect(maxWeightAllTime(sets)).toBe(22.5);
		expect(maxWeightAllTime([{ ...sets[3] }])).toBeNull();
	});

	test("builds daily max series including null days", () => {
		expect(buildDailyMaxWeightSeries(sets, ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04"])).toEqual([
			{ dayKey: "2026-01-01", maxWeight: 22.5 },
			{ dayKey: "2026-01-02", maxWeight: 21 },
			{ dayKey: "2026-01-03", maxWeight: null },
			{ dayKey: "2026-01-04", maxWeight: null },
		]);
	});
});
