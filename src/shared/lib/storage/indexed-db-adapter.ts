import { type DBSchema, deleteDB, type IDBPDatabase, openDB } from "idb";
import type { StorageAdapter } from "./contract";
import { type MetaRowGoals, metaRowWithoutLegacyGoal, normalizeGoalsFromMeta } from "./meta-goals";
import { migrateExerciseCatalogV2 } from "./migrate-exercise-catalog-v2";
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
				if (oldVersion < 2 && transaction) {
					await migrateExerciseCatalogV2(transaction);
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

export function createIndexedDbStorageAdapter(): StorageAdapter {
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
			const goals = normalizeGoalsFromMeta(meta);
			const hadLegacyOnly = Boolean(meta.goal) && !meta.goalsByExerciseTypeId;
			if (hadLegacyOnly && Object.keys(goals).length > 0) {
				await db.put("meta", metaRowWithoutLegacyGoal(meta, goals));
			}
			return goals;
		},

		async putGoalForExercise(goal: PersistedGoal) {
			const db = await getDb();
			const meta = await readMetaRow(db);
			const goals = normalizeGoalsFromMeta(meta);
			goals[goal.exerciseTypeId] = goal;
			await db.put("meta", metaRowWithoutLegacyGoal(meta, goals));
		},

		async clearGoalForExercise(exerciseTypeId: string) {
			const db = await getDb();
			const meta = await readMetaRow(db);
			const goals = normalizeGoalsFromMeta(meta);
			delete goals[exerciseTypeId];
			await db.put("meta", metaRowWithoutLegacyGoal(meta, goals));
		},

		async getAllExerciseTypes() {
			const db = await getDb();
			return db.getAll("exerciseTypes");
		},

		async putExerciseType(row: PersistedExerciseType) {
			const db = await getDb();
			await db.put("exerciseTypes", row);
		},

		async getExerciseType(id: string) {
			const db = await getDb();
			return db.get("exerciseTypes", id);
		},

		async getMeta() {
			const db = await getDb();
			const meta = await readMetaRow(db);
			return { schemaVersion: meta.schemaVersion };
		},

		async setMeta(meta: PersistedMeta) {
			const db = await getDb();
			const prev = await readMetaRow(db);
			const goals = normalizeGoalsFromMeta(prev);
			await db.put("meta", metaRowWithoutLegacyGoal({ ...prev, schemaVersion: meta.schemaVersion }, goals));
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
