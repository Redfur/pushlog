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

	beforeEach(() => {
		// Мокаем Intl.DateTimeFormat чтобы возвращать TEST_TIMEZONE
		vi.stubGlobal("Intl", {
			...Intl,
			DateTimeFormat: vi.fn(() => ({
				resolvedOptions: () => ({ timeZone: TEST_TIMEZONE }),
			})),
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("validates timezone ids", () => {
		expect(isValidTimeZoneId(TEST_TIMEZONE)).toBe(true);
		expect(isValidTimeZoneId("UTC")).toBe(true); // UTC должен быть валидным
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
