export const STATS_NS = "stats";

export const statsTranslations = {
	ru: {
		title: "Статистика",
		totalReps: "Всего повторений",
		totalSets: "Всего подходов",
		activeDays: "Дней с тренировкой",
		avgPerDay: "В среднем за активный день",
		bestDay: "Лучший день",
		bestDayValue: "{{date}} — {{count}}",
		noData: "Нет данных",
		trendsTitle: "Динамика по дням",
		period7d: "7 дней",
		period30d: "30 дней",
		chartReps: "Повторения",
		chartSets: "Подходы",
		trendsEmpty: "Пока нет записей за этот период.",
		tooltipReps: "Повторения",
		tooltipSets: "Подходы",
		heatmapTitle: "Активность",
		heatmapWeeks: "Последние {{count}} недель",
		heatmapLess: "Меньше",
		heatmapMore: "Больше",
		heatmapDayTooltip: "{{date}}: {{reps}} повт.",
		heatmapFuture: "Будущее",
	},
} as const;
