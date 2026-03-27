export type { StorageAdapter } from "./contract";
export {
	createIndexedDbStorageAdapter,
	getStorageAdapter,
} from "./indexed-db-adapter";
export type { PersistedGoal, PersistedMeta, PersistedSet } from "./schema";
