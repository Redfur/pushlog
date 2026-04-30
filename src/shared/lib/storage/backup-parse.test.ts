import { describe, expect, test } from "vitest";
import { PUSHLOG_BACKUP_FORMAT, PUSHLOG_BACKUP_VERSION, parsePushlogBackup } from "./backup-parse";

function validBackupJson(): string {
	return JSON.stringify({
		format: PUSHLOG_BACKUP_FORMAT,
		version: PUSHLOG_BACKUP_VERSION,
		exportedAt: "2026-01-10T10:00:00.000Z",
		meta: { schemaVersion: 1 },
		exerciseTypes: [
			{
				id: "et-1",
				name: "Push-ups",
				iconDisplay: "lucide",
				iconKey: "activity",
				iconEmojiText: "",
				nameInitialGlyph: "P",
				colorKind: "preset",
				colorValue: "#111111",
				trackWeightInSets: false,
				archivedAt: null,
				createdAt: "2026-01-01T10:00:00.000Z",
				updatedAt: "2026-01-01T10:00:00.000Z",
				version: 1,
			},
		],
		sets: [
			{
				id: "s-1",
				exerciseTypeId: "et-1",
				reps: 20,
				createdAt: "2026-01-02T10:00:00.000Z",
				dayKey: "2026-01-02",
				version: 1,
			},
		],
		goalsByExerciseTypeId: {
			"et-1": {
				id: "g-1",
				exerciseTypeId: "et-1",
				targetRepsPerDay: 50,
				effectiveFrom: "2026-01-02T10:00:00.000Z",
				updatedAt: "2026-01-02T10:00:00.000Z",
			},
		},
	});
}

describe("parsePushlogBackup", () => {
	test("parses valid backup payload", () => {
		const parsed = parsePushlogBackup(validBackupJson());
		expect(parsed.format).toBe(PUSHLOG_BACKUP_FORMAT);
		expect(parsed.version).toBe(PUSHLOG_BACKUP_VERSION);
		expect(parsed.sets).toHaveLength(1);
		expect(parsed.exerciseTypes).toHaveLength(1);
		expect(parsed.goalsByExerciseTypeId["et-1"].targetRepsPerDay).toBe(50);
	});

	test("rejects backup with unsupported format version", () => {
		const payload = JSON.parse(validBackupJson()) as Record<string, unknown>;
		payload.version = 999;
		expect(() => parsePushlogBackup(JSON.stringify(payload))).toThrow(
			"Неподдерживаемая версия формата резервной копии.",
		);
	});

	test("rejects when set points to missing exercise type", () => {
		const payload = JSON.parse(validBackupJson()) as {
			sets: Array<Record<string, unknown>>;
		};
		payload.sets[0].exerciseTypeId = "missing";
		expect(() => parsePushlogBackup(JSON.stringify(payload))).toThrow(
			"Подход s-1 ссылается на отсутствующий тип упражнения.",
		);
	});

	test("rejects when goal key does not match exerciseTypeId in goal", () => {
		const payload = JSON.parse(validBackupJson()) as {
			goalsByExerciseTypeId: Record<string, { exerciseTypeId: string }>;
		};
		payload.goalsByExerciseTypeId["et-1"].exerciseTypeId = "et-other";
		expect(() => parsePushlogBackup(JSON.stringify(payload))).toThrow(
			"Ключ цели не совпадает с exerciseTypeId внутри записи.",
		);
	});
});
