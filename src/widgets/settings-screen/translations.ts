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
		regionSection: "Регион и цели",
		exercisesCatalogHint: "Список и настройка типов упражнений — на главной странице и в карточке каждого типа.",
		exercisesCatalogLink: "Перейти на главную",
		dangerSection: "Данные и сброс",
		clearIndexedDb: "Удалить данные тренировок",
		clearIndexedDbDetail:
			"Все подходы и дневные цели по упражнениям в локальной базе (IndexedDB). Настройки интерфейса не удаляются.",
		clearIndexedDbConfirm: "Удалить все записи?",
		clearLocalStorage: "Сбросить настройки интерфейса",
		clearLocalStorageDetail:
			"Тема, часовой пояс, выбранный тип упражнения для записи и пользовательские быстрые кнопки (localStorage). Данные тренировок не затрагиваются.",
		clearLocalStorageConfirm: "Сбросить настройки интерфейса?",
		clearAll: "Очистить всё",
		clearAllDetail: "Удалить данные тренировок и сбросить настройки интерфейса. Страница перезагрузится.",
		clearAllConfirm: "Очистить всё и перезагрузить?",
		confirmAction: "Выполнить",
		cancelDialog: "Отмена",
	},
} as const;
