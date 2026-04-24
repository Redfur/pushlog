import { normalizeExerciseTypeRow, type PersistedExerciseTypeLoose } from "./normalize-exercise-type-row";
import type { PersistedExerciseType, PersistedGoal, PersistedMeta, PersistedSet } from "./schema";

export const PUSHLOG_BACKUP_FORMAT = "pushlog-backup";
export const PUSHLOG_BACKUP_VERSION = 1;

export type PushlogBackupPayload = {
	format: typeof PUSHLOG_BACKUP_FORMAT;
	version: typeof PUSHLOG_BACKUP_VERSION;
	exportedAt: string;
	meta: PersistedMeta;
	sets: PersistedSet[];
	exerciseTypes: PersistedExerciseType[];
	goalsByExerciseTypeId: Record<string, PersistedGoal>;
};

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isIsoDateLike(value: unknown): value is string {
	if (typeof value !== "string") return false;
	return !Number.isNaN(Date.parse(value));
}

function isPositiveInteger(value: unknown): value is number {
	return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isDayKey(value: unknown): value is string {
	return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseSet(value: unknown): PersistedSet {
	if (!isObject(value)) throw new Error("Некорректный формат подхода.");
	if (typeof value.id !== "string" || !value.id) throw new Error("У подхода отсутствует id.");
	if (typeof value.exerciseTypeId !== "string" || !value.exerciseTypeId) {
		throw new Error("У подхода отсутствует exerciseTypeId.");
	}
	if (!isPositiveInteger(value.reps)) throw new Error("У подхода некорректное число повторений.");
	if (!isIsoDateLike(value.createdAt)) throw new Error("У подхода некорректное время создания.");
	if (!isDayKey(value.dayKey)) throw new Error("У подхода некорректный dayKey.");
	if (!isPositiveInteger(value.version)) throw new Error("У подхода некорректная версия.");
	if (
		!(
			value.weightValue === undefined ||
			value.weightValue === null ||
			(typeof value.weightValue === "number" && Number.isFinite(value.weightValue) && value.weightValue >= 0)
		)
	) {
		throw new Error("У подхода некорректный вес.");
	}

	return {
		id: value.id,
		exerciseTypeId: value.exerciseTypeId,
		reps: value.reps,
		...(value.weightValue !== undefined ? { weightValue: value.weightValue } : {}),
		createdAt: value.createdAt,
		dayKey: value.dayKey,
		version: value.version,
	};
}

function parseGoal(value: unknown): PersistedGoal {
	if (!isObject(value)) throw new Error("Некорректный формат цели.");
	if (typeof value.id !== "string" || !value.id) throw new Error("У цели отсутствует id.");
	if (typeof value.exerciseTypeId !== "string" || !value.exerciseTypeId) {
		throw new Error("У цели отсутствует exerciseTypeId.");
	}
	if (!isPositiveInteger(value.targetRepsPerDay)) throw new Error("У цели некорректное значение targetRepsPerDay.");
	if (!isIsoDateLike(value.effectiveFrom)) throw new Error("У цели некорректное значение effectiveFrom.");
	if (!isIsoDateLike(value.updatedAt)) throw new Error("У цели некорректное значение updatedAt.");

	return {
		id: value.id,
		exerciseTypeId: value.exerciseTypeId,
		targetRepsPerDay: value.targetRepsPerDay,
		effectiveFrom: value.effectiveFrom,
		updatedAt: value.updatedAt,
	};
}

function parseExerciseType(value: unknown): PersistedExerciseType {
	if (!isObject(value)) throw new Error("Некорректный формат типа упражнения.");
	if (typeof value.id !== "string" || !value.id) throw new Error("У типа упражнения отсутствует id.");
	if (typeof value.name !== "string" || !value.name.trim()) {
		throw new Error("У типа упражнения отсутствует имя.");
	}
	if (!(value.archivedAt === null || isIsoDateLike(value.archivedAt))) {
		throw new Error("У типа упражнения некорректное archivedAt.");
	}
	if (!isIsoDateLike(value.createdAt) || !isIsoDateLike(value.updatedAt)) {
		throw new Error("У типа упражнения некорректное время создания или обновления.");
	}
	if (!isPositiveInteger(value.version)) throw new Error("У типа упражнения некорректная версия.");

	const normalized = normalizeExerciseTypeRow(value as PersistedExerciseTypeLoose);
	if (!normalized.name.trim()) throw new Error("У типа упражнения пустое имя после нормализации.");
	return normalized;
}

function parseMeta(value: unknown): PersistedMeta {
	if (!isObject(value)) throw new Error("Некорректный формат метаданных.");
	if (!isPositiveInteger(value.schemaVersion)) {
		throw new Error("Некорректный schemaVersion в метаданных.");
	}
	return { schemaVersion: value.schemaVersion };
}

function ensureUniqueIds<T extends { id: string }>(rows: T[], label: string): void {
	const seen = new Set<string>();
	for (const row of rows) {
		if (seen.has(row.id)) {
			throw new Error(`В резервной копии дублируется ${label} id: ${row.id}`);
		}
		seen.add(row.id);
	}
}

export function parsePushlogBackup(raw: string): PushlogBackupPayload {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw) as unknown;
	} catch {
		throw new Error("Файл не является корректным JSON.");
	}

	if (!isObject(parsed)) throw new Error("Некорректный формат файла резервной копии.");
	if (parsed.format !== PUSHLOG_BACKUP_FORMAT) throw new Error("Файл не похож на резервную копию pushlog.");
	if (parsed.version !== PUSHLOG_BACKUP_VERSION) {
		throw new Error("Неподдерживаемая версия формата резервной копии.");
	}
	if (!isIsoDateLike(parsed.exportedAt)) throw new Error("В резервной копии отсутствует корректная дата экспорта.");
	if (!Array.isArray(parsed.sets)) throw new Error("В резервной копии отсутствует массив подходов.");
	if (!Array.isArray(parsed.exerciseTypes)) throw new Error("В резервной копии отсутствует массив типов упражнений.");
	if (!isObject(parsed.goalsByExerciseTypeId)) throw new Error("В резервной копии отсутствуют цели.");

	const sets = parsed.sets.map(parseSet);
	const exerciseTypes = parsed.exerciseTypes.map(parseExerciseType);
	const goalsByExerciseTypeId = Object.fromEntries(
		Object.entries(parsed.goalsByExerciseTypeId).map(([exerciseTypeId, goal]) => {
			const parsedGoal = parseGoal(goal);
			if (parsedGoal.exerciseTypeId !== exerciseTypeId) {
				throw new Error("Ключ цели не совпадает с exerciseTypeId внутри записи.");
			}
			return [exerciseTypeId, parsedGoal];
		}),
	);
	const meta = parseMeta(parsed.meta);

	ensureUniqueIds(sets, "set");
	ensureUniqueIds(exerciseTypes, "exerciseType");

	const exerciseTypeIds = new Set(exerciseTypes.map((row) => row.id));
	for (const row of sets) {
		if (!exerciseTypeIds.has(row.exerciseTypeId)) {
			throw new Error(`Подход ${row.id} ссылается на отсутствующий тип упражнения.`);
		}
	}
	for (const goal of Object.values(goalsByExerciseTypeId)) {
		if (!exerciseTypeIds.has(goal.exerciseTypeId)) {
			throw new Error(`Цель ${goal.id} ссылается на отсутствующий тип упражнения.`);
		}
	}

	return {
		format: PUSHLOG_BACKUP_FORMAT,
		version: PUSHLOG_BACKUP_VERSION,
		exportedAt: parsed.exportedAt,
		meta,
		sets,
		exerciseTypes,
		goalsByExerciseTypeId,
	};
}
