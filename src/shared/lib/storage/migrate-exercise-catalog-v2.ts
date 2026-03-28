import {
	createDefaultSeedExerciseType,
	EXERCISE_TYPE_ROW_VERSION,
	isExerciseTypeUuid,
	isValidExerciseIconKey,
	LEGACY_EXERCISE_TYPE_DEFAULTS,
} from "@/shared/config/exercise-type-presets";
import { type MetaRowGoals, metaRowWithoutLegacyGoal, normalizeGoalsFromMeta } from "./meta-goals";
import type { PersistedExerciseType, PersistedGoal, PersistedSet } from "./schema";

const META_KEY = "app";

type VersionChangeTx = {
	objectStore(name: "sets"): {
		getAll(): Promise<PersistedSet[]>;
		put(value: PersistedSet): Promise<unknown>;
	};
	objectStore(name: "meta"): {
		get(key: string): Promise<MetaRowGoals | undefined>;
		put(value: MetaRowGoals): Promise<unknown>;
	};
	objectStore(name: "exerciseTypes"): {
		getAll(): Promise<PersistedExerciseType[]>;
		get(key: string): Promise<PersistedExerciseType | undefined>;
		put(value: PersistedExerciseType): Promise<unknown>;
	};
};

/**
 * Заполняет `exerciseTypes`, переносит легаси id в UUID, обновляет `sets` и цели в meta.
 * Вызывать один раз при переходе на версию БД 2 (пустой каталог после создания store).
 */
export async function migrateExerciseCatalogV2(transaction: VersionChangeTx): Promise<void> {
	const etStore = transaction.objectStore("exerciseTypes");
	const existing = await etStore.getAll();
	if (existing.length > 0) return;

	const setsStore = transaction.objectStore("sets");
	const metaStore = transaction.objectStore("meta");
	const sets = await setsStore.getAll();
	const metaRow = (await metaStore.get(META_KEY)) ?? ({ key: META_KEY, schemaVersion: 1 } satisfies MetaRowGoals);
	const goals = normalizeGoalsFromMeta(metaRow);

	const now = new Date().toISOString();
	const idSet = new Set<string>();
	for (const s of sets) idSet.add(s.exerciseTypeId);
	for (const k of Object.keys(goals)) idSet.add(k);

	const legacyToUuid = new Map<string, string>();

	for (const rawId of idSet) {
		if (isExerciseTypeUuid(rawId)) {
			const row = await etStore.get(rawId);
			if (!row) {
				const stub: PersistedExerciseType = {
					id: rawId,
					name: "Упражнение",
					iconKey: "activity",
					colorKind: "preset",
					colorValue: "chart-5",
					archivedAt: null,
					createdAt: now,
					updatedAt: now,
					version: EXERCISE_TYPE_ROW_VERSION,
				};
				await etStore.put(stub);
			}
			continue;
		}

		const uuid = crypto.randomUUID();
		legacyToUuid.set(rawId, uuid);
		const legacyDef = LEGACY_EXERCISE_TYPE_DEFAULTS[rawId];
		const iconKey = legacyDef?.iconKey ?? "activity";
		const colorValue = legacyDef?.colorValue ?? "chart-5";
		const row: PersistedExerciseType = {
			id: uuid,
			name: legacyDef?.name ?? rawId,
			iconKey: isValidExerciseIconKey(iconKey) ? iconKey : "activity",
			colorKind: "preset",
			colorValue,
			archivedAt: null,
			createdAt: now,
			updatedAt: now,
			version: EXERCISE_TYPE_ROW_VERSION,
		};
		await etStore.put(row);
	}

	for (const s of sets) {
		const nextId = legacyToUuid.get(s.exerciseTypeId) ?? s.exerciseTypeId;
		if (nextId !== s.exerciseTypeId) {
			await setsStore.put({ ...s, exerciseTypeId: nextId });
		}
	}

	const newGoals: Record<string, PersistedGoal> = {};
	for (const [k, g] of Object.entries(goals)) {
		const nk = legacyToUuid.get(k) ?? k;
		newGoals[nk] = { ...g, exerciseTypeId: nk };
	}

	await metaStore.put(metaRowWithoutLegacyGoal(metaRow, newGoals));

	const after = await etStore.getAll();
	if (after.length === 0) {
		await etStore.put(createDefaultSeedExerciseType(now));
	}
}
