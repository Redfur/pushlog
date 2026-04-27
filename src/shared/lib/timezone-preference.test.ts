import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { clearStoredTimeZone, isValidTimeZoneId, readStoredTimeZone, writeStoredTimeZone } from "./timezone-preference";

type LocalStorageLike = {
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
	removeItem: (key: string) => void;
};

function mockLocalStorage(store: Record<string, string> = {}): LocalStorageLike {
	return {
		getItem: (key) => (key in store ? store[key] : null),
		setItem: (key, value) => {
			store[key] = value;
		},
		removeItem: (key) => {
			delete store[key];
		},
	};
}

describe("timezone-preference", () => {
	const TEST_TIMEZONE = "Europe/London";

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("validates timezone ids", () => {
		expect(isValidTimeZoneId(TEST_TIMEZONE)).toBe(true);
		expect(isValidTimeZoneId("Bad/Timezone")).toBe(false);
	});

	test("reads and writes stored timezone", () => {
		const store: Record<string, string> = {};
		vi.stubGlobal("localStorage", mockLocalStorage(store));

		writeStoredTimeZone(TEST_TIMEZONE);
		expect(readStoredTimeZone()).toBe(TEST_TIMEZONE);

		clearStoredTimeZone();
		expect(readStoredTimeZone()).toBeNull();
	});
});
