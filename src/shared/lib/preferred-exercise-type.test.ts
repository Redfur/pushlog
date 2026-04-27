import { afterEach, describe, expect, test, vi } from "vitest";
import { readStoredPreferredExerciseTypeRaw, writePreferredExerciseTypeId } from "./preferred-exercise-type";

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

describe("preferred-exercise-type", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("reads and writes preferred exercise id", () => {
		const store: Record<string, string> = {};
		vi.stubGlobal("localStorage", mockLocalStorage(store));

		expect(readStoredPreferredExerciseTypeRaw()).toBeNull();
		writePreferredExerciseTypeId("et-123");
		expect(readStoredPreferredExerciseTypeRaw()).toBe("et-123");
	});
});
