import { describe, expect, test, vi } from "vitest";
import { canLogSetsForDay, dayKeyFromDate, localDateToDayKey, offsetDayKey, resolveDayRouteParam } from "./day-key";

describe("day-key helpers", () => {
	test("dayKeyFromDate projects date to target timezone day", () => {
		const date = new Date("2026-01-01T23:30:00.000Z");
		expect(dayKeyFromDate(date, "UTC")).toBe("2026-01-01");
		expect(dayKeyFromDate(date, "Europe/Moscow")).toBe("2026-01-02");
	});

	test("offsetDayKey shifts across month boundary", () => {
		expect(offsetDayKey("2026-03-01", -1, "UTC")).toBe("2026-02-28");
		expect(offsetDayKey("2024-03-01", -1, "UTC")).toBe("2024-02-29");
	});

	test("resolveDayRouteParam handles tokens and validates explicit key", () => {
		const fixedNow = new Date("2026-02-10T12:00:00.000Z");
		vi.useFakeTimers();
		vi.setSystemTime(fixedNow);

		expect(resolveDayRouteParam("today", "UTC")).toBe("2026-02-10");
		expect(resolveDayRouteParam("yesterday", "UTC")).toBe("2026-02-09");
		expect(resolveDayRouteParam("2026-02-28", "UTC")).toBe("2026-02-28");
		expect(resolveDayRouteParam("2026-02-31", "UTC")).toBeNull();
		expect(resolveDayRouteParam("not-a-day", "UTC")).toBeNull();

		vi.useRealTimers();
	});

	test("canLogSetsForDay disallows future days", () => {
		const fixedNow = new Date("2026-02-10T12:00:00.000Z");
		vi.useFakeTimers();
		vi.setSystemTime(fixedNow);

		expect(canLogSetsForDay("2026-02-10", "UTC")).toBe(true);
		expect(canLogSetsForDay("2026-02-09", "UTC")).toBe(true);
		expect(canLogSetsForDay("2026-02-11", "UTC")).toBe(false);

		vi.useRealTimers();
	});

	test("localDateToDayKey keeps local calendar day", () => {
		expect(localDateToDayKey(new Date(2026, 0, 9))).toBe("2026-01-09");
	});
});
