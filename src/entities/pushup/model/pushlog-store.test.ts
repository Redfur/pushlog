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

describe("usePushlogStore exercise type operations", () => {
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
				"et-1": {
					id: "et-1",
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
			},
			preferredExerciseTypeId: "et-1",
			hydrated: true,
			lastError: null,
			timeZone: "UTC",
		});
	});

	test("addExerciseType creates new exercise with valid data", async () => {
		const id = await usePushlogStore.getState().addExerciseType({
			name: "  Squats  ",
			iconDisplay: "lucide",
			iconKey: "dumbbell",
			iconEmojiText: "",
			nameInitialGlyph: "S",
			colorKind: "preset",
			colorValue: "#2563eb",
			trackWeightInSets: true,
		});

		expect(id).toBeDefined();
		expect(testMocks.storage.putExerciseType).toHaveBeenCalledTimes(1);
		expect(testMocks.reachGoal).toHaveBeenCalledWith("exercise/create", { name: "Squats" });

		// biome-ignore lint/style/noNonNullAssertion: for tests
		const created = usePushlogStore.getState().exerciseTypesById[id!];
		expect(created.name).toBe("Squats");
		expect(created.trackWeightInSets).toBe(true);
		expect(created.colorValue).toBe("#2563eb");
	});

	test("addExerciseType rejects empty name", async () => {
		const id = await usePushlogStore.getState().addExerciseType({
			name: "   ",
			iconDisplay: "lucide",
			iconKey: "activity",
			iconEmojiText: "",
			nameInitialGlyph: "",
			colorKind: "preset",
			colorValue: "#e11d48",
			trackWeightInSets: false,
		});

		expect(id).toBeUndefined();
		expect(testMocks.storage.putExerciseType).not.toHaveBeenCalled();
	});

	test("addExerciseType falls back to valid icon and color on invalid input", async () => {
		const id = await usePushlogStore.getState().addExerciseType({
			name: "Test",
			iconDisplay: "lucide",
			iconKey: "invalid-icon",
			iconEmojiText: "",
			nameInitialGlyph: "T",
			colorKind: "preset",
			colorValue: "invalid-color",
			trackWeightInSets: false,
		});

		// biome-ignore lint/style/noNonNullAssertion: for tests
		const created = usePushlogStore.getState().exerciseTypesById[id!];
		expect(created.iconKey).toBe("activity");
		expect(created.colorValue).toBe("#e11d48");
	});

	test("addExerciseType rolls back on storage error", async () => {
		testMocks.storage.putExerciseType.mockRejectedValueOnce(new Error("storage-error"));

		const id = await usePushlogStore.getState().addExerciseType({
			name: "Test",
			iconDisplay: "lucide",
			iconKey: "activity",
			iconEmojiText: "",
			nameInitialGlyph: "T",
			colorKind: "preset",
			colorValue: "#e11d48",
			trackWeightInSets: false,
		});

		expect(id).toBeUndefined();
		expect(usePushlogStore.getState().lastError).toBe("storage-error");
		expect(Object.keys(usePushlogStore.getState().exerciseTypesById)).toHaveLength(1);
	});

	test("updateExerciseType updates exercise fields", async () => {
		const ok = await usePushlogStore.getState().updateExerciseType("et-1", {
			name: "Modified Push-ups",
			trackWeightInSets: true,
		});

		expect(ok).toBe(true);
		expect(testMocks.storage.putExerciseType).toHaveBeenCalledTimes(1);
		expect(testMocks.reachGoal).toHaveBeenCalledWith("exercise/edit", { name: "Modified Push-ups" });

		const updated = usePushlogStore.getState().exerciseTypesById["et-1"];
		expect(updated.name).toBe("Modified Push-ups");
		expect(updated.trackWeightInSets).toBe(true);
	});

	test("updateExerciseType returns false for non-existent exercise", async () => {
		const ok = await usePushlogStore.getState().updateExerciseType("non-existent", {
			name: "Test",
		});

		expect(ok).toBe(false);
		expect(testMocks.storage.putExerciseType).not.toHaveBeenCalled();
	});

	test("updateExerciseType rolls back on storage error", async () => {
		testMocks.storage.putExerciseType.mockRejectedValueOnce(new Error("update-error"));

		const ok = await usePushlogStore.getState().updateExerciseType("et-1", {
			name: "New Name",
		});

		expect(ok).toBe(false);
		expect(usePushlogStore.getState().lastError).toBe("update-error");
		expect(usePushlogStore.getState().exerciseTypesById["et-1"].name).toBe("Push-ups");
	});

	test("archiveExerciseType archives exercise and updates preferred", async () => {
		usePushlogStore.setState({
			exerciseTypesById: {
				"et-1": {
					id: "et-1",
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
				"et-2": {
					id: "et-2",
					name: "Squats",
					iconDisplay: "lucide",
					iconKey: "dumbbell",
					iconEmojiText: "",
					nameInitialGlyph: "S",
					colorKind: "preset",
					colorValue: "#2563eb",
					trackWeightInSets: false,
					archivedAt: null,
					createdAt: "2026-01-02T00:00:00.000Z",
					updatedAt: "2026-01-02T00:00:00.000Z",
					version: 3,
				},
			},
			preferredExerciseTypeId: "et-1",
		});

		const ok = await usePushlogStore.getState().archiveExerciseType("et-1");

		expect(ok).toBe(true);
		expect(testMocks.storage.putExerciseType).toHaveBeenCalledTimes(1);
		expect(testMocks.reachGoal).toHaveBeenCalledWith("exercise/archive", { name: "Push-ups" });

		const archived = usePushlogStore.getState().exerciseTypesById["et-1"];
		expect(archived.archivedAt).not.toBeNull();
		expect(usePushlogStore.getState().preferredExerciseTypeId).toBe("et-2");
	});

	test("archiveExerciseType returns false for already archived exercise", async () => {
		usePushlogStore.setState({
			exerciseTypesById: {
				"et-1": {
					id: "et-1",
					name: "Push-ups",
					iconDisplay: "lucide",
					iconKey: "activity",
					iconEmojiText: "",
					nameInitialGlyph: "P",
					colorKind: "preset",
					colorValue: "#e11d48",
					trackWeightInSets: false,
					archivedAt: "2026-01-05T00:00:00.000Z",
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-05T00:00:00.000Z",
					version: 3,
				},
			},
		});

		const ok = await usePushlogStore.getState().archiveExerciseType("et-1");

		expect(ok).toBe(false);
		expect(testMocks.storage.putExerciseType).not.toHaveBeenCalled();
	});

	test("unarchiveExerciseType restores archived exercise", async () => {
		usePushlogStore.setState({
			exerciseTypesById: {
				"et-1": {
					id: "et-1",
					name: "Push-ups",
					iconDisplay: "lucide",
					iconKey: "activity",
					iconEmojiText: "",
					nameInitialGlyph: "P",
					colorKind: "preset",
					colorValue: "#e11d48",
					trackWeightInSets: false,
					archivedAt: "2026-01-05T00:00:00.000Z",
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-05T00:00:00.000Z",
					version: 3,
				},
			},
			preferredExerciseTypeId: "",
		});

		const ok = await usePushlogStore.getState().unarchiveExerciseType("et-1");

		expect(ok).toBe(true);
		expect(testMocks.storage.putExerciseType).toHaveBeenCalledTimes(1);
		expect(testMocks.reachGoal).toHaveBeenCalledWith("exercise/unarchive", { name: "Push-ups" });

		const unarchived = usePushlogStore.getState().exerciseTypesById["et-1"];
		expect(unarchived.archivedAt).toBeNull();
		expect(usePushlogStore.getState().preferredExerciseTypeId).toBe("et-1");
	});

	test("deleteExerciseType removes exercise and related data", async () => {
		usePushlogStore.setState({
			sets: [
				{
					id: "s-1",
					exerciseTypeId: "et-1",
					reps: 10,
					dayKey: "2026-01-10",
					createdAt: "2026-01-10T10:00:00.000Z",
					version: 2,
				},
				{
					id: "s-2",
					exerciseTypeId: "et-2",
					reps: 15,
					dayKey: "2026-01-10",
					createdAt: "2026-01-10T11:00:00.000Z",
					version: 2,
				},
			],
			goalsByExercise: {
				"et-1": {
					id: "g-1",
					exerciseTypeId: "et-1",
					targetRepsPerDay: 50,
					effectiveFrom: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
			exerciseTypesById: {
				"et-1": {
					id: "et-1",
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
				"et-2": {
					id: "et-2",
					name: "Squats",
					iconDisplay: "lucide",
					iconKey: "dumbbell",
					iconEmojiText: "",
					nameInitialGlyph: "S",
					colorKind: "preset",
					colorValue: "#2563eb",
					trackWeightInSets: false,
					archivedAt: null,
					createdAt: "2026-01-02T00:00:00.000Z",
					updatedAt: "2026-01-02T00:00:00.000Z",
					version: 3,
				},
			},
			preferredExerciseTypeId: "et-1",
		});

		const ok = await usePushlogStore.getState().deleteExerciseType("et-1");

		expect(ok).toBe(true);
		expect(testMocks.storage.deleteExerciseType).toHaveBeenCalledWith("et-1");
		expect(testMocks.reachGoal).toHaveBeenCalledWith("exercise/delete", { name: "Push-ups" });

		expect(usePushlogStore.getState().exerciseTypesById["et-1"]).toBeUndefined();
		expect(usePushlogStore.getState().sets).toHaveLength(1);
		expect(usePushlogStore.getState().sets[0].id).toBe("s-2");
		expect(usePushlogStore.getState().goalsByExercise["et-1"]).toBeUndefined();
		expect(usePushlogStore.getState().preferredExerciseTypeId).toBe("et-2");
	});

	test("deleteExerciseType rolls back all changes on storage error", async () => {
		const initialState = {
			sets: [
				{
					id: "s-1",
					exerciseTypeId: "et-1",
					reps: 10,
					dayKey: "2026-01-10",
					createdAt: "2026-01-10T10:00:00.000Z",
					version: 2,
				},
			],
			goalsByExercise: {
				"et-1": {
					id: "g-1",
					exerciseTypeId: "et-1",
					targetRepsPerDay: 50,
					effectiveFrom: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
			exerciseTypesById: {
				"et-1": {
					id: "et-1",
					name: "Push-ups",
					iconDisplay: "lucide" as const,
					iconKey: "activity",
					iconEmojiText: "",
					nameInitialGlyph: "P",
					colorKind: "preset" as const,
					colorValue: "#e11d48",
					trackWeightInSets: false,
					archivedAt: null,
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
					version: 3,
				},
			},
			preferredExerciseTypeId: "et-1",
		};

		usePushlogStore.setState(initialState);
		testMocks.storage.deleteExerciseType.mockRejectedValueOnce(new Error("delete-error"));

		const ok = await usePushlogStore.getState().deleteExerciseType("et-1");

		expect(ok).toBe(false);
		expect(usePushlogStore.getState().lastError).toBe("delete-error");
		expect(usePushlogStore.getState().exerciseTypesById["et-1"]).toBeDefined();
		expect(usePushlogStore.getState().sets).toHaveLength(1);
		expect(usePushlogStore.getState().goalsByExercise["et-1"]).toBeDefined();
		expect(usePushlogStore.getState().preferredExerciseTypeId).toBe("et-1");
	});
});

describe("usePushlogStore goal operations", () => {
	beforeEach(() => {
		testMocks.generatedId = 0;
		testMocks.reachGoal.mockReset();
		for (const fn of Object.values(testMocks.storage)) {
			fn.mockReset();
		}

		testMocks.storage.putGoalForExercise.mockResolvedValue(undefined);
		testMocks.storage.clearGoalForExercise.mockResolvedValue(undefined);

		usePushlogStore.setState({
			sets: [],
			goalsByExercise: {},
			exerciseTypesById: {
				"et-1": {
					id: "et-1",
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
			},
			preferredExerciseTypeId: "et-1",
			hydrated: true,
			lastError: null,
			timeZone: "UTC",
		});
	});

	test("setDailyGoal creates new goal", async () => {
		await usePushlogStore.getState().setDailyGoal(100, "et-1");

		expect(testMocks.storage.putGoalForExercise).toHaveBeenCalledTimes(1);
		expect(testMocks.reachGoal).toHaveBeenCalledWith("exercise/goal_set", { target_reps_per_day: 100 });

		const goal = usePushlogStore.getState().goalsByExercise["et-1"];
		expect(goal.targetRepsPerDay).toBe(100);
		expect(goal.exerciseTypeId).toBe("et-1");
	});

	test("setDailyGoal floors decimal values", async () => {
		await usePushlogStore.getState().setDailyGoal(99.9, "et-1");

		const goal = usePushlogStore.getState().goalsByExercise["et-1"];
		expect(goal.targetRepsPerDay).toBe(99);
	});

	test("setDailyGoal rejects non-positive values", async () => {
		await usePushlogStore.getState().setDailyGoal(0, "et-1");
		expect(testMocks.storage.putGoalForExercise).not.toHaveBeenCalled();

		await usePushlogStore.getState().setDailyGoal(-10, "et-1");
		expect(testMocks.storage.putGoalForExercise).not.toHaveBeenCalled();
	});

	test("clearDailyGoal removes existing goal", async () => {
		usePushlogStore.setState({
			goalsByExercise: {
				"et-1": {
					id: "g-1",
					exerciseTypeId: "et-1",
					targetRepsPerDay: 50,
					effectiveFrom: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
		});

		await usePushlogStore.getState().clearDailyGoal("et-1");

		expect(testMocks.storage.clearGoalForExercise).toHaveBeenCalledWith("et-1");
		expect(testMocks.reachGoal).toHaveBeenCalledWith("exercise/goal_clear");
		expect(usePushlogStore.getState().goalsByExercise["et-1"]).toBeUndefined();
	});

	test("clearDailyGoal does nothing for non-existent goal", async () => {
		await usePushlogStore.getState().clearDailyGoal("et-1");

		expect(testMocks.storage.clearGoalForExercise).not.toHaveBeenCalled();
	});

	test("clearDailyGoal rolls back on storage error", async () => {
		usePushlogStore.setState({
			goalsByExercise: {
				"et-1": {
					id: "g-1",
					exerciseTypeId: "et-1",
					targetRepsPerDay: 50,
					effectiveFrom: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
			},
		});

		testMocks.storage.clearGoalForExercise.mockRejectedValueOnce(new Error("clear-error"));

		await usePushlogStore.getState().clearDailyGoal("et-1");

		expect(usePushlogStore.getState().lastError).toBe("clear-error");
		expect(usePushlogStore.getState().goalsByExercise["et-1"]).toBeDefined();
	});
});

describe("usePushlogStore timezone operations", () => {
	beforeEach(() => {
		testMocks.storedTimeZone = null;
		testMocks.reachGoal.mockReset();

		usePushlogStore.setState({
			sets: [],
			goalsByExercise: {},
			exerciseTypesById: {},
			preferredExerciseTypeId: "",
			hydrated: true,
			lastError: null,
			timeZone: "UTC",
		});
	});

	test("setTimeZone updates timezone and stores it", async () => {
		usePushlogStore.getState().setTimeZone("Europe/London");

		expect(testMocks.storedTimeZone).toBe("Europe/London");
		expect(usePushlogStore.getState().timeZone).toBe("Europe/London");
		expect(testMocks.reachGoal).toHaveBeenCalledWith("settings/timezone/change", {
			is_auto: 0,
			timezone: "Europe/London",
		});
	});

	test("setTimeZone clears stored timezone on auto value", async () => {
		testMocks.storedTimeZone = "Europe/London";

		usePushlogStore.getState().setTimeZone("__auto__");

		expect(testMocks.storedTimeZone).toBeNull();
		expect(usePushlogStore.getState().timeZone).toBe("UTC");
		expect(testMocks.reachGoal).toHaveBeenCalledWith("settings/timezone/change", { is_auto: 1 });
	});

	test("setTimeZone does nothing for same timezone", async () => {
		testMocks.storedTimeZone = "Europe/London";
		usePushlogStore.setState({ timeZone: "Europe/London" });

		usePushlogStore.getState().setTimeZone("Europe/London");

		expect(testMocks.reachGoal).not.toHaveBeenCalled();
	});
});

describe("usePushlogStore restoreSet operation", () => {
	beforeEach(() => {
		testMocks.storage.putSet.mockReset();
		testMocks.storage.putSet.mockResolvedValue(undefined);

		usePushlogStore.setState({
			sets: [],
			goalsByExercise: {},
			exerciseTypesById: {
				"et-1": {
					id: "et-1",
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
			},
			preferredExerciseTypeId: "et-1",
			hydrated: true,
			lastError: null,
			timeZone: "UTC",
		});
	});

	test("restoreSet adds set back to store", async () => {
		const set = {
			id: "s-1",
			exerciseTypeId: "et-1",
			reps: 20,
			dayKey: "2026-01-10",
			createdAt: "2026-01-10T10:00:00.000Z",
			version: 2,
		};

		const ok = await usePushlogStore.getState().restoreSet(set);

		expect(ok).toBe(true);
		expect(testMocks.storage.putSet).toHaveBeenCalledWith(set);
		expect(usePushlogStore.getState().sets).toHaveLength(1);
		expect(usePushlogStore.getState().sets[0].id).toBe("s-1");
	});

	test("restoreSet rejects set for non-existent exercise", async () => {
		const set = {
			id: "s-1",
			exerciseTypeId: "non-existent",
			reps: 20,
			dayKey: "2026-01-10",
			createdAt: "2026-01-10T10:00:00.000Z",
			version: 2,
		};

		const ok = await usePushlogStore.getState().restoreSet(set);

		expect(ok).toBe(false);
		expect(testMocks.storage.putSet).not.toHaveBeenCalled();
		expect(usePushlogStore.getState().sets).toHaveLength(0);
	});

	test("restoreSet rolls back on storage error", async () => {
		testMocks.storage.putSet.mockRejectedValueOnce(new Error("restore-error"));

		const set = {
			id: "s-1",
			exerciseTypeId: "et-1",
			reps: 20,
			dayKey: "2026-01-10",
			createdAt: "2026-01-10T10:00:00.000Z",
			version: 2,
		};

		const ok = await usePushlogStore.getState().restoreSet(set);

		expect(ok).toBe(false);
		expect(usePushlogStore.getState().lastError).toBe("restore-error");
		expect(usePushlogStore.getState().sets).toHaveLength(0);
	});
});
