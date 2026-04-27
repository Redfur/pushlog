import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	storage: {
		getAllSets: vi.fn(),
		getAllExerciseTypes: vi.fn(),
		getGoals: vi.fn(),
		getMeta: vi.fn(),
	},
	replaceData: vi.fn(),
	parseBackup: vi.fn(),
}));

vi.mock("./indexed-db-adapter", () => ({
	getStorageAdapter: () => mocks.storage,
	replacePushlogIndexedDatabaseData: mocks.replaceData,
}));

vi.mock("./backup-parse", () => ({
	PUSHLOG_BACKUP_FORMAT: "pushlog-backup",
	PUSHLOG_BACKUP_VERSION: 1,
	parsePushlogBackup: mocks.parseBackup,
}));

import {
	buildPushlogBackupFilename,
	createPushlogBackup,
	parsePushlogBackupAsync,
	restorePushlogFromBackup,
	serializePushlogBackup,
} from "./backup";

describe("backup", () => {
	beforeEach(() => {
		mocks.parseBackup.mockReset();
		mocks.replaceData.mockReset();
		mocks.storage.getAllSets.mockReset();
		mocks.storage.getAllExerciseTypes.mockReset();
		mocks.storage.getGoals.mockReset();
		mocks.storage.getMeta.mockReset();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("createPushlogBackup collects and sorts data", async () => {
		mocks.storage.getAllSets.mockResolvedValue([
			{
				id: "s2",
				createdAt: "2026-01-01T10:00:00.000Z",
				reps: 10,
				exerciseTypeId: "et",
				dayKey: "2026-01-01",
				version: 1,
			},
			{
				id: "s1",
				createdAt: "2026-01-01T10:00:00.000Z",
				reps: 5,
				exerciseTypeId: "et",
				dayKey: "2026-01-01",
				version: 1,
			},
		]);
		mocks.storage.getAllExerciseTypes.mockResolvedValue([
			{
				id: "et2",
				name: "B",
				iconDisplay: "lucide",
				iconKey: "activity",
				iconEmojiText: "",
				nameInitialGlyph: "B",
				colorKind: "preset",
				colorValue: "#e11d48",
				trackWeightInSets: false,
				archivedAt: null,
				createdAt: "2026-01-01T11:00:00.000Z",
				updatedAt: "2026-01-01T11:00:00.000Z",
				version: 1,
			},
			{
				id: "et1",
				name: "A",
				iconDisplay: "lucide",
				iconKey: "activity",
				iconEmojiText: "",
				nameInitialGlyph: "A",
				colorKind: "preset",
				colorValue: "#e11d48",
				trackWeightInSets: false,
				archivedAt: null,
				createdAt: "2026-01-01T11:00:00.000Z",
				updatedAt: "2026-01-01T11:00:00.000Z",
				version: 1,
			},
		]);
		mocks.storage.getGoals.mockResolvedValue({ et1: { id: "g1" } });
		mocks.storage.getMeta.mockResolvedValue({ schemaVersion: 1 });

		const backup = await createPushlogBackup();

		expect(backup.format).toBe("pushlog-backup");
		expect(backup.version).toBe(1);
		expect(backup.sets.map((x: { id: string }) => x.id)).toEqual(["s1", "s2"]);
		expect(backup.exerciseTypes.map((x: { id: string }) => x.id)).toEqual(["et1", "et2"]);
		expect(backup.meta).toEqual({ schemaVersion: 1 });
	});

	test("serializePushlogBackup returns pretty JSON", () => {
		const raw = serializePushlogBackup({
			format: "pushlog-backup",
			version: 1,
			exportedAt: "x",
			meta: { schemaVersion: 1 },
			sets: [],
			exerciseTypes: [],
			goalsByExerciseTypeId: {},
		});
		expect(raw).toContain("\n");
		expect(raw).toContain('"format": "pushlog-backup"');
	});

	test("parsePushlogBackupAsync falls back when Worker is unavailable", async () => {
		mocks.parseBackup.mockReturnValueOnce({ ok: true });
		vi.stubGlobal("Worker", undefined);

		await expect(parsePushlogBackupAsync("raw-json")).resolves.toEqual({ ok: true });
		expect(mocks.parseBackup).toHaveBeenCalledWith("raw-json");
	});

	test("parsePushlogBackupAsync resolves worker success response", async () => {
		let instance: {
			onmessage?: (event: MessageEvent<{ ok: true; payload: { from: string } }>) => void;
			terminate: ReturnType<typeof vi.fn>;
			postMessage: (message: { raw: string }) => void;
		} | null = null;

		class WorkerMock {
			onmessage?: (event: MessageEvent<{ ok: true; payload: { from: string } }>) => void;
			onerror?: () => void;
			terminate = vi.fn();
			constructor() {
				instance = this;
			}
			postMessage(message: { raw: string }) {
				expect(message).toEqual({ raw: "raw-json" });
				this.onmessage?.({ data: { ok: true, payload: { from: "worker" } } } as MessageEvent<{
					ok: true;
					payload: { from: string };
				}>);
			}
		}

		vi.stubGlobal("Worker", WorkerMock);

		await expect(parsePushlogBackupAsync("raw-json")).resolves.toEqual({ from: "worker" });
		expect(instance?.terminate).toHaveBeenCalledTimes(1);
	});

	test("parsePushlogBackupAsync falls back to sync parse on worker error", async () => {
		mocks.parseBackup.mockReturnValueOnce({ from: "fallback" });

		class WorkerMock {
			onmessage?: () => void;
			onerror?: () => void;
			terminate = vi.fn();
			postMessage() {
				this.onerror?.();
			}
		}

		vi.stubGlobal("Worker", WorkerMock);

		await expect(parsePushlogBackupAsync("raw-json")).resolves.toEqual({ from: "fallback" });
		expect(mocks.parseBackup).toHaveBeenCalledWith("raw-json");
	});

	test("restorePushlogFromBackup forwards payload to indexeddb replace", async () => {
		const progress = vi.fn();
		const backup = {
			format: "pushlog-backup",
			version: 1,
			exportedAt: "2026-01-01T00:00:00.000Z",
			meta: { schemaVersion: 1 },
			sets: [{ id: "s1" }],
			exerciseTypes: [{ id: "et1" }],
			goalsByExerciseTypeId: { et1: { id: "g1" } },
		};

		await restorePushlogFromBackup(backup, progress);

		expect(mocks.replaceData).toHaveBeenCalledWith(
			{
				meta: backup.meta,
				sets: backup.sets,
				exerciseTypes: backup.exerciseTypes,
				goalsByExerciseTypeId: backup.goalsByExerciseTypeId,
			},
			progress,
		);
	});

	test("buildPushlogBackupFilename formats date", () => {
		expect(buildPushlogBackupFilename(new Date("2026-04-27T12:00:00.000Z"))).toBe("pushlog-backup-2026-04-27.json");
	});
});
