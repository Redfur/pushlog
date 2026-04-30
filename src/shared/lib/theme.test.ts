import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getThemePreference, initTheme, setThemePreference, THEME_CHANGE_EVENT } from "./theme";

const testMocks = vi.hoisted(() => ({
	reachGoalMock: vi.fn(),
}));

vi.mock("@/shared/lib/pushlog-analytics", () => ({
	pushlogAnalytics: {
		reachGoal: testMocks.reachGoalMock,
	},
}));

vi.mock("@/shared/lib/client-storage-keys", () => ({
	CLIENT_STORAGE_KEYS: {
		theme: "pushlog.theme",
	},
}));

describe("theme", () => {
	let store: Record<string, string>;
	let darkClassList: Set<string>;
	let dispatchedEvents: CustomEvent[];
	let mediaQueryListeners: Array<(e: MediaQueryListEvent) => void>;
	let prefersDark: boolean;

	beforeEach(() => {
		store = {};
		darkClassList = new Set();
		dispatchedEvents = [];
		mediaQueryListeners = [];
		prefersDark = false;
		testMocks.reachGoalMock.mockReset();

		vi.stubGlobal("localStorage", {
			getItem: (key: string) => store[key] ?? null,
			setItem: (key: string, value: string) => {
				store[key] = value;
			},
		});

		vi.stubGlobal("document", {
			documentElement: {
				classList: {
					toggle: (cls: string, force: boolean) => {
						if (cls === "dark") {
							if (force) darkClassList.add(cls);
							else darkClassList.delete(cls);
						}
					},
				},
			},
		});

		vi.stubGlobal("window", {
			matchMedia: (query: string) => {
				if (query === "(prefers-color-scheme: dark)") {
					return {
						matches: prefersDark,
						addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
							mediaQueryListeners.push(handler);
						},
						removeEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
							const idx = mediaQueryListeners.indexOf(handler);
							if (idx >= 0) mediaQueryListeners.splice(idx, 1);
						},
					};
				}
				return { matches: false };
			},
			dispatchEvent: (event: CustomEvent) => {
				dispatchedEvents.push(event);
			},
		});

		vi.stubGlobal(
			"CustomEvent",
			class {
				type: string;
				detail: unknown;
				constructor(type: string, options?: { detail?: unknown }) {
					this.type = type;
					this.detail = options?.detail;
				}
			},
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("defaults to system preference when no stored value", () => {
		expect(getThemePreference()).toBe("system");
	});

	test("reads stored preference", () => {
		store["pushlog.theme"] = "dark";
		expect(getThemePreference()).toBe("dark");

		store["pushlog.theme"] = "light";
		expect(getThemePreference()).toBe("light");
	});

	test("initTheme applies dark class based on system preference", () => {
		prefersDark = true;
		initTheme();
		expect(darkClassList.has("dark")).toBe(true);

		prefersDark = false;
		darkClassList.clear();
		initTheme();
		expect(darkClassList.has("dark")).toBe(false);
	});

	test("initTheme dispatches theme change event", () => {
		initTheme();
		expect(dispatchedEvents).toHaveLength(1);
		expect(dispatchedEvents[0]?.type).toBe(THEME_CHANGE_EVENT);
		expect(dispatchedEvents[0]?.detail).toEqual({
			preference: "system",
			resolved: "light",
		});
	});

	test("setThemePreference stores and applies new preference", () => {
		setThemePreference("dark");
		expect(store["pushlog.theme"]).toBe("dark");
		expect(darkClassList.has("dark")).toBe(true);
		expect(testMocks.reachGoalMock).toHaveBeenCalledWith("settings/theme/change", { preference: "dark" });
	});

	test("setThemePreference does nothing if preference unchanged", () => {
		store["pushlog.theme"] = "light";
		dispatchedEvents = [];
		setThemePreference("light");
		expect(dispatchedEvents).toHaveLength(0);
		expect(testMocks.reachGoalMock).not.toHaveBeenCalled();
	});

	test("attaches system listener when preference is system", () => {
		initTheme();
		expect(mediaQueryListeners).toHaveLength(1);
	});

	test("detaches system listener when switching from system to explicit theme", () => {
		initTheme();
		expect(mediaQueryListeners).toHaveLength(1);

		setThemePreference("dark");
		expect(mediaQueryListeners).toHaveLength(0);
	});

	test("system listener updates theme when system preference changes", () => {
		prefersDark = false;
		initTheme();
		expect(darkClassList.has("dark")).toBe(false);

		prefersDark = true;
		const handler = mediaQueryListeners[0];
		if (handler) {
			handler({ matches: true } as MediaQueryListEvent);
		}

		expect(darkClassList.has("dark")).toBe(true);
		expect(dispatchedEvents.length).toBeGreaterThan(1);
	});

	test("system listener does not update if preference changed to explicit", () => {
		prefersDark = false;
		initTheme();
		setThemePreference("light");
		darkClassList.clear();
		dispatchedEvents = [];

		prefersDark = true;
		const handler = mediaQueryListeners[0];
		if (handler) {
			handler({ matches: true } as MediaQueryListEvent);
		}

		expect(darkClassList.has("dark")).toBe(false);
		expect(dispatchedEvents).toHaveLength(0);
	});
});
