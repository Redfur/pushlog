import { beforeEach, describe, expect, test, vi } from "vitest";

const testMocks = vi.hoisted(() => {
	const storage = {
		getAllSets: vi.fn(async () => []),
		putSet: vi.fn(async () => {}),
		deleteSet: vi.fn(async () => {}),
		getGoals: vi.fn(async () => ({})),
		putGoalForExercise: vi.fn(async () => {}),
		clearGoalForExercise: vi.fn(async () => {}),
		getAllExerciseTypes: vi.fn(async () => []),
		putExerciseType: vi.fn(async () => {}),
		deleteExerciseType: vi.fn(async () => {}),
		getExerciseType: vi.fn(async () => undefined),
		getMeta: vi.fn(async () => ({ schemaVersion: 1 })),
		setMeta: vi.fn(async () => {}),
	};

	return {
		storage,
		reachGoal: vi.fn(),
		generatedId: 0,
		preferredRaw: null as string | null,
		storedTimeZone: null as string | null,
	};
});

vi.mock("@/shared/lib/storage", () => ({
	getStorageAdapter: () => testMocks.storage,
}));

vi.mock("@/shared/lib/pushlog-analytics", () => ({
	pushlogAnalytics: {
		reachGoal: testMocks.reachGoal,
	},
}));

vi.mock("@/shared/lib/id", () => ({
	generateId: () => `generated-${++testMocks.generatedId}`,
}));

vi.mock("@/shared/lib/day-key", () => ({
	getDefaultTimeZone: () => "UTC",
	nowDayKey: () => "2026-01-10",
	canLogSetsForDay: (dayKey: string) => dayKey <= "2026-01-10",
	offsetDayKey: (dayKey: string, offset: number) => {
		const [y, m, d] = dayKey.split("-").map(Number);
		const dt = new Date(Date.UTC(y, m - 1, d + offset));
		return dt.toISOString().slice(0, 10);
	},
}));

vi.mock("@/shared/lib/preferred-exercise-type", () => ({
	readStoredPreferredExerciseTypeRaw: () => testMocks.preferredRaw,
	writePreferredExerciseTypeId: (id: string) => {
		testMocks.preferredRaw = id;
	},
}));

vi.mock("@/shared/lib/timezone-preference", () => ({
	TIMEZONE_AUTO_SELECT_VALUE: "__auto__",
	readStoredTimeZone: () => testMocks.storedTimeZone,
	writeStoredTimeZone: (timeZone: string) => {
		testMocks.storedTimeZone = timeZone;
	},
	clearStoredTimeZone: () => {
		testMocks.storedTimeZone = null;
	},
	isValidTimeZoneId: () => true,
}));

import { usePushlogStore } from "./pushlog-store";

describe("usePushlogStore critical actions", () => {
	beforeEach(() => {
		testMocks.generatedId = 0;
		testMocks.preferredRaw = null;
		testMocks.storedTimeZone = null;
		testMocks.reachGoal.mockReset();
		for (const fn of Object.values(testMocks.storage)) {
			fn.mockReset();
		}

		testMocks.storage.getAllSets.mockResolvedValue([]);
		testMocks.storage.putSet.mockResolvedValue(undefined);
		testMocks.storage.deleteSet.mockResolvedValue(undefined);
		testMocks.storage.getGoals.mockResolvedValue({});
		testMocks.storage.putGoalForExercise.mockResolvedValue(undefined);
		testMocks.storage.clearGoalForExercise.mockResolvedValue(undefined);
		testMocks.storage.getAllExerciseTypes.mockResolvedValue([]);
		testMocks.storage.putExerciseType.mockResolvedValue(undefined);
		testMocks.storage.deleteExerciseType.mockResolvedValue(undefined);
		testMocks.storage.getExerciseType.mockResolvedValue(undefined);
		testMocks.storage.getMeta.mockResolvedValue({ schemaVersion: 1 });
		testMocks.storage.setMeta.mockResolvedValue(undefined);

		usePushlogStore.setState({
			sets: [],
			goalsByExercise: {},
			exerciseTypesById: {
				"et-plain": {
					id: "et-plain",
					name: "Push-ups",
					iconDisplay: "lucide",
					iconKey: "activity",
					iconEmojiText: "",
					nameInitialGlyph: "P",
					colorKind: "preset",
					colorValue: "#e11d48",
					trackWeightInSets: false,
					archivedAt: null,
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
					version: 3,
				},
				"et-weight": {
					id: "et-weight",
					name: "Dumbbell press",
					iconDisplay: "lucide",
					iconKey: "dumbbell",
					iconEmojiText: "",
					nameInitialGlyph: "D",
					colorKind: "preset",
					colorValue: "#2563eb",
					trackWeightInSets: true,
					archivedAt: null,
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
					version: 3,
				},
			},
			preferredExerciseTypeId: "et-plain",
			hydrated: true,
			lastError: null,
			timeZone: "UTC",
		});
	});

	test("addSet stores floored reps and rounded weight", async () => {
		const id = await usePushlogStore.getState().addSet(12.9, {
			exerciseTypeId: "et-weight",
			dayKey: "2026-01-10",
			weightKg: 42.126,
		});

		expect(id).toBe("generated-1");
		expect(testMocks.storage.putSet).toHaveBeenCalledTimes(1);

		const saved = usePushlogStore.getState().sets[0];
		expect(saved.reps).toBe(12);
		expect(saved.weightValue).toBe(42.13);
		expect(saved.exerciseTypeId).toBe("et-weight");
	});

	test("addSet rejects future day and missing weight for weighted exercise", async () => {
		const future = await usePushlogStore.getState().addSet(10, {
			exerciseTypeId: "et-plain",
			dayKey: "2026-01-11",
		});
		const missingWeight = await usePushlogStore.getState().addSet(10, {
			exerciseTypeId: "et-weight",
			dayKey: "2026-01-10",
		});

		expect(future).toBeUndefined();
		expect(missingWeight).toBeUndefined();
		expect(usePushlogStore.getState().sets).toHaveLength(0);
		expect(testMocks.storage.putSet).not.toHaveBeenCalled();
	});

	test("addSet rolls back optimistic update on storage error", async () => {
		testMocks.storage.putSet.mockRejectedValueOnce(new Error("db-write-failed"));

		const id = await usePushlogStore.getState().addSet(15, {
			exerciseTypeId: "et-plain",
			dayKey: "2026-01-10",
		});

		expect(id).toBeUndefined();
		expect(usePushlogStore.getState().sets).toHaveLength(0);
		expect(usePushlogStore.getState().lastError).toBe("db-write-failed");
	});

	test("removeSet restores removed row when delete fails", async () => {
		usePushlogStore.setState({
			sets: [
				{
					id: "s-1",
					exerciseTypeId: "et-plain",
					reps: 20,
					dayKey: "2026-01-10",
					createdAt: "2026-01-10T12:00:00.000Z",
					version: 2,
				},
			],
		});
		testMocks.storage.deleteSet.mockRejectedValueOnce(new Error("db-delete-failed"));

		const ok = await usePushlogStore.getState().removeSet("s-1");

		expect(ok).toBe(false);
		expect(usePushlogStore.getState().sets).toHaveLength(1);
		expect(usePushlogStore.getState().sets[0].id).toBe("s-1");
		expect(usePushlogStore.getState().lastError).toBe("db-delete-failed");
	});

	test("setDailyGoal rolls back to previous goal when persistence fails", async () => {
		usePushlogStore.setState({
			goalsByExercise: {
				"et-plain": {
					id: "g-old",
					exerciseTypeId: "et-plain",
					targetRepsPerDay: 30,
					effectiveFrom: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
		});
		testMocks.storage.putGoalForExercise.mockRejectedValueOnce(new Error("goal-save-failed"));

		await usePushlogStore.getState().setDailyGoal(55.9, "et-plain");

		const goal = usePushlogStore.getState().goalsByExercise["et-plain"];
		expect(goal.id).toBe("g-old");
		expect(goal.targetRepsPerDay).toBe(30);
		expect(usePushlogStore.getState().lastError).toBe("goal-save-failed");
	});
});
