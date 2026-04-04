export const SET_DAILY_GOAL_NS = "setDailyGoal";

export const setDailyGoalTranslations = {
	ru: {
		sectionTitle: "Дневная цель",
		label: "Цель (повторений в день)",
		save: "Сохранить",
		clear: "Сбросить",
		singleExerciseHint: "Прогресс к цели показывается на экране дня для этого типа.",
		optionalHint: "Необязательно. Можно задать сразу или позже в редактировании упражнения.",
		goalDisabledArchivedHint: "Для архивного типа цель не редактируется.",
		goalInputInvalid: "Введите целое число повторений больше нуля или оставьте поле пустым.",
		toastGoalPersistFailed: "Не удалось сохранить дневную цель",
	},
} as const;
