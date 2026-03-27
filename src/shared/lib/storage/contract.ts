import type { PersistedGoal, PersistedMeta, PersistedSet } from "./schema";

export interface StorageAdapter {
	getAllSets(): Promise<PersistedSet[]>;
	putSet(set: PersistedSet): Promise<void>;
	deleteSet(id: string): Promise<void>;
	getGoal(): Promise<PersistedGoal | null>;
	putGoal(goal: PersistedGoal): Promise<void>;
	clearGoal(): Promise<void>;
	getMeta(): Promise<PersistedMeta>;
	setMeta(meta: PersistedMeta): Promise<void>;
}
