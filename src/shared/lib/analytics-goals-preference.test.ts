import { afterEach, describe, expect, test, vi } from "vitest";
import { readAnalyticsGoalsEnabled, writeAnalyticsGoalsEnabled } from "./analytics-goals-preference";

type LocalStorageLike = {
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
};

function mockLocalStorage(store: Record<string, string> = {}): LocalStorageLike {
	return {
		getItem: (key) => (key in store ? store[key] : null),
		setItem: (key, value) => {
			store[key] = value;
		},
	};
}

describe("analytics-goals-preference", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("defaults to enabled when key is absent", () => {
		vi.stubGlobal("localStorage", mockLocalStorage());
		expect(readAnalyticsGoalsEnabled()).toBe(true);
	});

	test("reads enabled/disabled flags", () => {
		vi.stubGlobal(
			"localStorage",
			mockLocalStorage({
				"pushlog.analyticsGoalsEnabled": "0",
			}),
		);
		expect(readAnalyticsGoalsEnabled()).toBe(false);

		vi.stubGlobal(
			"localStorage",
			mockLocalStorage({
				"pushlog.analyticsGoalsEnabled": "true",
			}),
		);
		expect(readAnalyticsGoalsEnabled()).toBe(true);
	});

	test("writes 1/0 to storage", () => {
		const store: Record<string, string> = {};
		vi.stubGlobal("localStorage", mockLocalStorage(store));

		writeAnalyticsGoalsEnabled(false);
		expect(store["pushlog.analyticsGoalsEnabled"]).toBe("0");

		writeAnalyticsGoalsEnabled(true);
		expect(store["pushlog.analyticsGoalsEnabled"]).toBe("1");
	});
});
