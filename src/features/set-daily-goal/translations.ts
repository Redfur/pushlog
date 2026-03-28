export const SET_DAILY_GOAL_NS = "setDailyGoal";

export const setDailyGoalTranslations = {
	ru: {
		sectionTitle: "Дневная цель",
		label: "Цель (повторений в день)",
		save: "Сохранить",
		clear: "Сбросить",
		hint: "Прогресс к цели показывается на экране дня для каждого упражнения отдельно.",
		exerciseTypeLabel: "Для какого упражнения",
		noExercisesHint: "Добавьте упражнения в разделе «Мои упражнения» в настройках.",
		singleExerciseHint: "Прогресс к цели показывается на экране дня для этого типа.",
		goalDisabledArchivedHint: "Для архивного типа цель не редактируется.",
	},
} as const;
