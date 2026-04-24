/**
 * Идентификаторы JavaScript-целей в кабинете Яндекс Метрики (совпадают 1:1).
 * Сгруппированы по префиксам: exercise/* — тренировки и типы; settings/* — UI и данные.
 */
export const METRIKA_GOALS = {
	// --- exercise: подходы, типы, цели по типу ---
	exerciseSetLogged: "exercise/set_logged",
	exerciseCreate: "exercise/create",
	exerciseEdit: "exercise/edit",
	exerciseArchive: "exercise/archive",
	exerciseUnarchive: "exercise/unarchive",
	exerciseDelete: "exercise/delete",
	exerciseGoalSet: "exercise/goal_set",
	exerciseGoalClear: "exercise/goal_clear",
	exerciseRemove: "exercise/remove",
	exercisePreferredChange: "exercise/preferred_change",

	// --- settings: тема, часовой пояс, данные, аналитика ---
	settingsThemeChange: "settings/theme/change",
	settingsTimezoneChange: "settings/timezone/change",
	settingsDataClearIndexedDb: "settings/data/clear_indexed_db",
	settingsDataClearLocalPreferences: "settings/data/clear_local_preferences",
	settingsDataClearAll: "settings/data/clear_all",
	settingsDataExportBackup: "settings/data/export_backup",
	settingsDataImportBackup: "settings/data/import_backup",
	settingsAnalyticsToggle: "settings/analytics/toggle",
} as const;

export type MetrikaGoalId = (typeof METRIKA_GOALS)[keyof typeof METRIKA_GOALS];
