/**
 * Пресеты иконок/цветов и утилиты для типов упражнений.
 * Каталог упражнений пользователя хранится в IndexedDB и в Zustand (`exerciseTypesById`).
 */
export {
	createDefaultSeedExerciseType,
	EXERCISE_COLOR_PRESET_KEYS,
	EXERCISE_ICON_PRESET_KEYS,
	EXERCISE_TYPE_ROW_VERSION,
	type ExerciseColorPresetKey,
	type ExerciseIconPresetKey,
	isExerciseTypeUuid,
	isLegacyExerciseTypeId,
	isValidCustomExerciseColor,
	isValidExerciseColorPreset,
	isValidExerciseIconKey,
	LEGACY_EXERCISE_TYPE_DEFAULTS,
	resolveExerciseTypeColor,
} from "./exercise-type-presets";
