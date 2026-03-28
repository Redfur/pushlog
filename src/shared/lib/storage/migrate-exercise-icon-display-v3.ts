import { EXERCISE_TYPE_ROW_VERSION } from "@/shared/config/exercise-type-presets";
import { normalizeExerciseTypeRow, type PersistedExerciseTypeLoose } from "./normalize-exercise-type-row";
import type { PersistedExerciseType } from "./schema";

type VersionChangeTx = {
	objectStore(name: "exerciseTypes"): {
		getAll(): Promise<PersistedExerciseType[]>;
		put(value: PersistedExerciseType): Promise<unknown>;
	};
};

/**
 * Дополняет записи `exerciseTypes` полями iconDisplay / iconEmojiText / nameInitialGlyph.
 */
export async function migrateExerciseIconDisplayV3(transaction: VersionChangeTx): Promise<void> {
	const store = transaction.objectStore("exerciseTypes");
	const all = await store.getAll();
	for (const row of all) {
		const normalized = normalizeExerciseTypeRow(row as PersistedExerciseTypeLoose);
		await store.put({
			...normalized,
			version: Math.max(normalized.version, EXERCISE_TYPE_ROW_VERSION),
		});
	}
}
