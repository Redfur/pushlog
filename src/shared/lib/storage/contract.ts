import type { PersistedExerciseType, PersistedGoal, PersistedMeta, PersistedSet } from "./schema";

export interface StorageAdapter {
	getAllSets(): Promise<PersistedSet[]>;
	putSet(set: PersistedSet): Promise<void>;
	deleteSet(id: string): Promise<void>;
	/** Цели по `exerciseTypeId` в `meta.goalsByExerciseTypeId`. */
	getGoals(): Promise<Record<string, PersistedGoal>>;
	putGoalForExercise(goal: PersistedGoal): Promise<void>;
	clearGoalForExercise(exerciseTypeId: string): Promise<void>;
	getAllExerciseTypes(): Promise<PersistedExerciseType[]>;
	putExerciseType(row: PersistedExerciseType): Promise<void>;
	/** Удаляет тип, все подходы по нему и цель в meta. */
	deleteExerciseType(id: string): Promise<void>;
	getExerciseType(id: string): Promise<PersistedExerciseType | undefined>;
	getMeta(): Promise<PersistedMeta>;
	setMeta(meta: PersistedMeta): Promise<void>;
}
