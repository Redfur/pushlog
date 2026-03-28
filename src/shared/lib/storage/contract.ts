import type { PersistedExerciseType, PersistedGoal, PersistedMeta, PersistedSet } from "./schema";

export interface StorageAdapter {
	getAllSets(): Promise<PersistedSet[]>;
	putSet(set: PersistedSet): Promise<void>;
	deleteSet(id: string): Promise<void>;
	/** Цели по `exerciseTypeId`; миграция из одиночного `goal` в meta при первом чтении. */
	getGoals(): Promise<Record<string, PersistedGoal>>;
	putGoalForExercise(goal: PersistedGoal): Promise<void>;
	clearGoalForExercise(exerciseTypeId: string): Promise<void>;
	getAllExerciseTypes(): Promise<PersistedExerciseType[]>;
	putExerciseType(row: PersistedExerciseType): Promise<void>;
	getExerciseType(id: string): Promise<PersistedExerciseType | undefined>;
	getMeta(): Promise<PersistedMeta>;
	setMeta(meta: PersistedMeta): Promise<void>;
}
