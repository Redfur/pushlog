export const SETTINGS_SCREEN_NS = "settings_screen";

export const settingsScreenTranslations = {
	ru: {
		title: "Настройки",
		themeSection: "Тема оформления",
		themeSystem: "Как в системе",
		themeLight: "Светлая",
		themeDark: "Тёмная",
		languageSection: "Язык",
		languageCurrent: "Русский",
		languageHint: "Другие языки интерфейса запланированы; пока доступен только русский.",
		regionSection: "Регион",
		dailyGoalHint:
			"Дневную цель по типу можно задать при создании упражнения или в режиме редактирования (главная → тип → «Редактировать»).",
		dailyGoalLink: "На главную",
		dangerSection: "Данные и сброс",
		clearIndexedDb: "Удалить данные тренировок",
		clearIndexedDbDetail:
			"Все подходы и дневные цели по упражнениям в локальной базе (IndexedDB). Настройки интерфейса не удаляются.",
		clearIndexedDbConfirm: "Удалить все записи?",
		clearLocalStorage: "Сбросить настройки интерфейса",
		clearLocalStorageDetail:
			"Тема оформления, часовой пояс и выбранный тип упражнения для записи (localStorage). Данные тренировок не затрагиваются. Переключатель анонимной статистики не сбрасывается.",
		analyticsGoalsLabel: "Анонимная статистика действий",
		analyticsGoalsHint:
			"Помогает понять, как используется приложение. Можно отключить — цели в Метрике отправляться не будут.",
		clearLocalStorageConfirm: "Сбросить настройки интерфейса?",
		clearAll: "Очистить всё",
		clearAllDetail: "Удалить данные тренировок и сбросить настройки интерфейса. Страница перезагрузится.",
		clearAllConfirm: "Очистить всё и перезагрузить?",
		confirmAction: "Выполнить",
		cancelDialog: "Отмена",
		aboutSection: "О приложении",
		aboutVersion: "Версия {{version}}",
		aboutRepository: "GitHub",
	},
} as const;
