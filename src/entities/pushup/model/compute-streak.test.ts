import { describe, expect, test } from "vitest";
import { computeStreak } from "./compute-streak";
import type { PushlogSet } from "./types";

const mk = (id: string, dayKey: string): PushlogSet => ({
	id,
	exerciseTypeId: "push",
	reps: 10,
	createdAt: "2026-01-01T10:00:00.000Z",
	dayKey,
	version: 2,
});

describe("computeStreak", () => {
	test("returns zero when today has no sets", () => {
		const sets = [mk("s1", "2026-01-01"), mk("s2", "2026-01-02")];
		expect(computeStreak(sets, "2026-01-03", "UTC")).toBe(0);
	});

	test("counts consecutive active days from today backwards", () => {
		const sets = [mk("s1", "2026-01-01"), mk("s2", "2026-01-03"), mk("s3", "2026-01-04"), mk("s4", "2026-01-04")];
		expect(computeStreak(sets, "2026-01-04", "UTC")).toBe(2);
	});
});
