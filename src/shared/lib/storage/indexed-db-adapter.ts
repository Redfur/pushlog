import { type DBSchema, deleteDB, type IDBPDatabase, openDB } from "idb";
import { createDefaultSeedExerciseTypes } from "@/shared/config/exercise-type-presets";
import type { StorageAdapter } from "./contract";
import { buildMetaRow, goalsFromMeta, type MetaRowGoals } from "./meta-goals";
import { normalizeExerciseTypeRow, type PersistedExerciseTypeLoose } from "./normalize-exercise-type-row";
import type { PersistedExerciseType, PersistedGoal, PersistedMeta, PersistedSet } from "./schema";

const DB_NAME = "pushlog";
const DB_VERSION = 2;
const CURRENT_SCHEMA_VERSION = 1;

interface PushlogDBSchema extends DBSchema {
	sets: {
		key: string;
		value: PersistedSet;
		indexes: { "by-dayKey": string };
	};
	meta: {
		key: string;
		value: MetaRowGoals;
	};
	exerciseTypes: {
		key: string;
		value: PersistedExerciseType;
	};
}

let dbPromise: Promise<IDBPDatabase<PushlogDBSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<PushlogDBSchema>> {
	if (!dbPromise) {
		dbPromise = openDB<PushlogDBSchema>(DB_NAME, DB_VERSION, {
			async upgrade(database, oldVersion, _newVersion, transaction) {
				if (!database.objectStoreNames.contains("sets")) {
					const setStore = database.createObjectStore("sets", { keyPath: "id" });
					setStore.createIndex("by-dayKey", "dayKey");
				}
				if (!database.objectStoreNames.contains("meta")) {
					database.createObjectStore("meta", { keyPath: "key" });
				}
				if (!database.objectStoreNames.contains("exerciseTypes")) {
					database.createObjectStore("exerciseTypes", { keyPath: "id" });
				}
				if (oldVersion === 0 && transaction) {
					const etStore = transaction.objectStore("exerciseTypes");
					const existing = await etStore.getAll();
					if (existing.length === 0) {
						const now = new Date().toISOString();
						for (const row of createDefaultSeedExerciseTypes(now)) {
							await etStore.put(row);
						}
					}
				}
			},
		});
	}
	return dbPromise;
}

const META_KEY = "app";

async function readMetaRow(db: IDBPDatabase<PushlogDBSchema>): Promise<MetaRowGoals> {
	const row = await db.get("meta", META_KEY);
	if (!row) {
		return { key: META_KEY, schemaVersion: CURRENT_SCHEMA_VERSION };
	}
	return row;
}

function createIndexedDbStorageAdapter(): StorageAdapter {
	return {
		async getAllSets() {
			const db = await getDb();
			return db.getAll("sets");
		},

		async putSet(set) {
			const db = await getDb();
			await db.put("sets", set);
		},

		async deleteSet(id) {
			const db = await getDb();
			await db.delete("sets", id);
		},

		async getGoals() {
			const db = await getDb();
			const meta = await readMetaRow(db);
			return goalsFromMeta(meta);
		},

		async putGoalForExercise(goal: PersistedGoal) {
			const db = await getDb();
			const meta = await readMetaRow(db);
			const goals = goalsFromMeta(meta);
			goals[goal.exerciseTypeId] = goal;
			await db.put("meta", buildMetaRow(meta, goals));
		},

		async clearGoalForExercise(exerciseTypeId: string) {
			const db = await getDb();
			const meta = await readMetaRow(db);
			const goals = goalsFromMeta(meta);
			delete goals[exerciseTypeId];
			await db.put("meta", buildMetaRow(meta, goals));
		},

		async getAllExerciseTypes() {
			const db = await getDb();
			const rows = await db.getAll("exerciseTypes");
			return rows.map((row) => normalizeExerciseTypeRow(row as PersistedExerciseTypeLoose));
		},

		async putExerciseType(row: PersistedExerciseType) {
			const db = await getDb();
			await db.put("exerciseTypes", row);
		},

		async getExerciseType(id: string) {
			const db = await getDb();
			const row = await db.get("exerciseTypes", id);
			return row ? normalizeExerciseTypeRow(row as PersistedExerciseTypeLoose) : undefined;
		},

		async getMeta() {
			const db = await getDb();
			const meta = await readMetaRow(db);
			return { schemaVersion: meta.schemaVersion };
		},

		async setMeta(meta: PersistedMeta) {
			const db = await getDb();
			const prev = await readMetaRow(db);
			const goals = goalsFromMeta(prev);
			await db.put("meta", buildMetaRow({ ...prev, schemaVersion: meta.schemaVersion }, goals));
		},
	};
}

let singleton: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
	if (!singleton) {
		singleton = createIndexedDbStorageAdapter();
	}
	return singleton;
}

/** Полное удаление БД на устройстве; следующее обращение к адаптеру создаст пустую БД. */
export async function wipePushlogIndexedDatabase(): Promise<void> {
	dbPromise = null;
	singleton = null;
	await deleteDB(DB_NAME);
}
