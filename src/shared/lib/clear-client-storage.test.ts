import { afterEach, describe, expect, test, vi } from "vitest";
import { clearClientStoragePreferences, PUSHLOG_CLIENT_STORAGE_CLEARED_EVENT } from "./clear-client-storage";
import { CLIENT_STORAGE_KEYS } from "./client-storage-keys";

const testMocks = vi.hoisted(() => ({
	initThemeMock: vi.fn(),
}));

vi.mock("@/shared/lib/theme", () => ({
	initTheme: testMocks.initThemeMock,
}));

describe("clearClientStoragePreferences", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		testMocks.initThemeMock.mockReset();
	});

	test("removes all known client-storage keys and re-inits theme", () => {
		const removed: string[] = [];
		const dispatchEvent = vi.fn();

		vi.stubGlobal("localStorage", {
			removeItem: (key: string) => removed.push(key),
		});
		vi.stubGlobal("window", { dispatchEvent });
		vi.stubGlobal(
			"CustomEvent",
			class {
				type: string;
				constructor(type: string) {
					this.type = type;
				}
			},
		);

		clearClientStoragePreferences();

		for (const key of Object.values(CLIENT_STORAGE_KEYS)) {
			expect(removed).toContain(key);
		}
		expect(testMocks.initThemeMock).toHaveBeenCalledTimes(1);
		expect(dispatchEvent).toHaveBeenCalledTimes(1);
		expect(dispatchEvent.mock.calls[0]?.[0].type).toBe(PUSHLOG_CLIENT_STORAGE_CLEARED_EVENT);
	});
});
