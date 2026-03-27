import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { StorageAdapter } from "./contract";
import type { PersistedGoal, PersistedMeta, PersistedSet } from "./schema";

const DB_NAME = "pushlog";
const DB_VERSION = 1;
const CURRENT_SCHEMA_VERSION = 1;

type MetaRow = {
	key: string;
	schemaVersion: number;
	goal?: PersistedGoal;
};

interface PushlogDBSchema extends DBSchema {
	sets: {
		key: string;
		value: PersistedSet;
		indexes: { "by-dayKey": string };
	};
	meta: {
		key: string;
		value: MetaRow;
	};
}

let dbPromise: Promise<IDBPDatabase<PushlogDBSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<PushlogDBSchema>> {
	if (!dbPromise) {
		dbPromise = openDB<PushlogDBSchema>(DB_NAME, DB_VERSION, {
			upgrade(database) {
				if (!database.objectStoreNames.contains("sets")) {
					const setStore = database.createObjectStore("sets", { keyPath: "id" });
					setStore.createIndex("by-dayKey", "dayKey");
				}
				if (!database.objectStoreNames.contains("meta")) {
					database.createObjectStore("meta", { keyPath: "key" });
				}
			},
		});
	}
	return dbPromise;
}

const META_KEY = "app";

async function readMetaRow(db: IDBPDatabase<PushlogDBSchema>): Promise<MetaRow> {
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

		async getGoal() {
			const db = await getDb();
			const meta = await readMetaRow(db);
			return meta.goal ?? null;
		},

		async putGoal(goal) {
			const db = await getDb();
			const meta = await readMetaRow(db);
			await db.put("meta", {
				key: META_KEY,
				schemaVersion: meta.schemaVersion,
				goal,
			});
		},

		async clearGoal() {
			const db = await getDb();
			const meta = await readMetaRow(db);
			await db.put("meta", {
				key: META_KEY,
				schemaVersion: meta.schemaVersion,
			});
		},

		async getMeta() {
			const db = await getDb();
			const meta = await readMetaRow(db);
			return { schemaVersion: meta.schemaVersion };
		},

		async setMeta(meta: PersistedMeta) {
			const db = await getDb();
			const prev = await readMetaRow(db);
			await db.put("meta", {
				key: META_KEY,
				schemaVersion: meta.schemaVersion,
				...(prev.goal ? { goal: prev.goal } : {}),
			});
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
