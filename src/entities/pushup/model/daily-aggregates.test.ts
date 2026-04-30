import { describe, expect, test } from "vitest";
import { buildDailyActivitySeries, buildHeatmapGrid, lastNDaysInclusive } from "./daily-aggregates";
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
		exerciseTypeId: "push",
		reps: 8,
		createdAt: "2026-01-01T12:00:00.000Z",
		dayKey: "2026-01-01",
		version: 2,
	},
	{
		id: "s3",
		exerciseTypeId: "dips",
		reps: 7,
		createdAt: "2026-01-02T12:00:00.000Z",
		dayKey: "2026-01-02",
		version: 2,
	},
];

describe("daily-aggregates", () => {
	test("returns last N day keys inclusively", () => {
		expect(lastNDaysInclusive("2026-01-03", 3, "UTC")).toEqual(["2026-01-01", "2026-01-02", "2026-01-03"]);
		expect(lastNDaysInclusive("2026-01-03", 0, "UTC")).toEqual([]);
	});

	test("builds daily activity series with zero-filled days", () => {
		expect(buildDailyActivitySeries(sets, ["2026-01-01", "2026-01-02", "2026-01-03"])).toEqual([
			{ dayKey: "2026-01-01", reps: 18, setCount: 2 },
			{ dayKey: "2026-01-02", reps: 7, setCount: 1 },
			{ dayKey: "2026-01-03", reps: 0, setCount: 0 },
		]);
	});

	test("builds heatmap grid with future cells nulled", () => {
		const grid = buildHeatmapGrid(sets, "2026-01-07", "UTC", 2);
		expect(grid).toHaveLength(14);

		const futureCells = grid.filter((x) => x.dayKey === null);
		expect(futureCells.length).toBeGreaterThan(0);

		const jan1 = grid.find((x) => x.dayKey === "2026-01-01");
		const jan2 = grid.find((x) => x.dayKey === "2026-01-02");
		expect(jan1?.reps).toBe(18);
		expect(jan2?.reps).toBe(7);
	});
});
