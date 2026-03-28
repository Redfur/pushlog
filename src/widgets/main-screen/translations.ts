export const MAIN_SCREEN_NS = "mainScreen";

export const mainScreenTranslations = {
	ru: {
		title: "Сегодня",
		titleYesterday: "Вчера",
		titleDay: "{{date}}",
		totalToday: "Всего за день: {{count}}",
		progressTowardGoal: "{{current}} / {{target}}",
		progressTypeLine: "{{name}} — {{reps}} повт.",
		progressTypeGoal: "{{name}}: {{current}} / {{target}}",
		totalEntriesLine: "Записей подходов за день: {{count}}",
		emptyDayProgress: "За этот день пока нет повторений.",
		empty: "Пока нет подходов — нажмите кнопку ниже.",
		quickAdd: "Быстро добавить",
		quickAddInputAria: "Своё число повторений, Enter — добавить",
		removePresetAria: "Убрать +{{count}} из быстрых",
		dayNavPrev: "Предыдущий день",
		dayNavNext: "Следующий день",
		dayNavPickDate: "Выбрать дату",
		futureDayReadOnly: "Будущие дни недоступны для записи.",
		noActiveExercisesHint: "Нет активных упражнений в каталоге — добавьте тип, чтобы записывать подходы.",
		noActiveExercisesLink: "Мои упражнения",
	},
} as const;
