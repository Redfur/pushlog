import {
	PUSHLOG_BACKUP_FORMAT,
	PUSHLOG_BACKUP_VERSION,
	type PushlogBackupPayload,
	parsePushlogBackup,
} from "./backup-parse";
import {
	getStorageAdapter,
	type ReplacePushlogDataInput,
	replacePushlogIndexedDatabaseData,
} from "./indexed-db-adapter";

export type { PushlogBackupPayload } from "./backup-parse";

export async function createPushlogBackup(): Promise<PushlogBackupPayload> {
	const storage = getStorageAdapter();
	const [sets, exerciseTypes, goalsByExerciseTypeId, meta] = await Promise.all([
		storage.getAllSets(),
		storage.getAllExerciseTypes(),
		storage.getGoals(),
		storage.getMeta(),
	]);

	const sortedSets = [...sets].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
	const sortedExerciseTypes = [...exerciseTypes].sort(
		(a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
	);

	return {
		format: PUSHLOG_BACKUP_FORMAT,
		version: PUSHLOG_BACKUP_VERSION,
		exportedAt: new Date().toISOString(),
		meta,
		sets: sortedSets,
		exerciseTypes: sortedExerciseTypes,
		goalsByExerciseTypeId,
	};
}

export function serializePushlogBackup(backup: PushlogBackupPayload): string {
	return JSON.stringify(backup, null, 2);
}

export async function parsePushlogBackupAsync(raw: string): Promise<PushlogBackupPayload> {
	if (typeof Worker === "undefined") {
		return parsePushlogBackup(raw);
	}

	return await new Promise<PushlogBackupPayload>((resolve, reject) => {
		const worker = new Worker(new URL("./backup-parse.worker.ts", import.meta.url), { type: "module" });
		worker.onmessage = (
			event: MessageEvent<{ ok: true; payload: PushlogBackupPayload } | { ok: false; error: string }>,
		) => {
			worker.terminate();
			if (event.data.ok) {
				resolve(event.data.payload);
				return;
			}
			reject(new Error(event.data.error));
		};
		worker.onerror = () => {
			worker.terminate();
			try {
				resolve(parsePushlogBackup(raw));
			} catch (error) {
				reject(error instanceof Error ? error : new Error(String(error)));
			}
		};
		worker.postMessage({ raw });
	});
}

export async function restorePushlogFromBackup(
	backup: PushlogBackupPayload,
	onProgress?: (value: number) => void,
): Promise<void> {
	const input: ReplacePushlogDataInput = {
		meta: backup.meta,
		sets: backup.sets,
		exerciseTypes: backup.exerciseTypes,
		goalsByExerciseTypeId: backup.goalsByExerciseTypeId,
	};
	await replacePushlogIndexedDatabaseData(input, onProgress);
}

export function buildPushlogBackupFilename(date = new Date()): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `pushlog-backup-${y}-${m}-${d}.json`;
}
