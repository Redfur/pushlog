import { afterEach, describe, expect, test, vi } from "vitest";
import { loadQuickAddDraft, saveQuickAddDraft } from "./quick-add-draft-storage";

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

describe("quick-add-draft-storage", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("loads null for missing or invalid draft", () => {
		vi.stubGlobal("localStorage", mockLocalStorage());
		expect(loadQuickAddDraft("et-1")).toBeNull();

		vi.stubGlobal("localStorage", mockLocalStorage({ "pushlog.quickAddDraft.v1": "{bad-json" }));
		expect(loadQuickAddDraft("et-1")).toBeNull();
	});

	test("saves and loads draft for exercise", () => {
		const store: Record<string, string> = {};
		vi.stubGlobal("localStorage", mockLocalStorage(store));

		saveQuickAddDraft("et-1", { reps: "25", weight: "42.5" });
		expect(loadQuickAddDraft("et-1")).toEqual({ reps: "25", weight: "42.5" });
	});

	test("does not save when exercise id is empty", () => {
		const store: Record<string, string> = {};
		vi.stubGlobal("localStorage", mockLocalStorage(store));

		saveQuickAddDraft("", { reps: "10", weight: "" });
		expect(Object.keys(store)).toHaveLength(0);
	});
});
