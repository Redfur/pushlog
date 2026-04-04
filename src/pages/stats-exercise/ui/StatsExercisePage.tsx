import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	computeStatsForExerciseType,
	lastNDaysInclusive,
	maxWeightAllTime,
	totalTonnageForDayKey,
	totalTonnageForDayKeys,
	usePushlogStore,
} from "@/entities/pushup";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import {
	isExerciseTypeUuid,
	pickExerciseTypeIconVisual,
	resolveExerciseTypeColor,
} from "@/shared/config/exercise-type-presets";
import { PageHeader, PageHeaderBackLink, ScreenBody } from "@/shared/layout";
import { bcp47FromI18nLang } from "@/shared/lib/format-day";
import { formatTonnageWithKgUnit, formatWeightKgDisplay } from "@/shared/lib/format-weight-kg";
import { StatsLoadingSkeleton } from "@/widgets/stats";
import { STATS_NS } from "@/widgets/stats/translations";
import { StatsHeatmap } from "@/widgets/stats/ui/StatsHeatmap";
import { StatsTonnageTrendCharts } from "@/widgets/stats/ui/StatsTonnageTrendCharts";
import { StatsTrendCharts } from "@/widgets/stats/ui/StatsTrendCharts";
import { StatsWeightTrendCharts } from "@/widgets/stats/ui/StatsWeightTrendCharts";

export function StatsExercisePage() {
	const { exerciseId } = useParams<{ exerciseId: string }>();
	const { t, i18n } = useTranslation(STATS_NS);
	const locale = bcp47FromI18nLang(i18n.language);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const sets = usePushlogStore((s) => s.sets);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const timeZone = usePushlogStore((s) => s.timeZone);
	const todayKey = useTodayDayKey(timeZone);

	const validId = exerciseId && isExerciseTypeUuid(exerciseId) ? exerciseId : null;
	const et = validId ? exerciseTypesById[validId] : undefined;

	const setsForType = useMemo(() => (validId ? sets.filter((s) => s.exerciseTypeId === validId) : []), [sets, validId]);

	const stats = useMemo(
		() => (validId ? computeStatsForExerciseType(sets, validId, todayKey, timeZone) : null),
		[sets, validId, todayKey, timeZone],
	);

	const maxWeight = useMemo(() => maxWeightAllTime(setsForType), [setsForType]);

	const tonnageToday = useMemo(() => totalTonnageForDayKey(setsForType, todayKey), [setsForType, todayKey]);
	const tonnage7d = useMemo(
		() => totalTonnageForDayKeys(setsForType, lastNDaysInclusive(todayKey, 7, timeZone)),
		[setsForType, todayKey, timeZone],
	);
	const tonnage30d = useMemo(
		() => totalTonnageForDayKeys(setsForType, lastNDaysInclusive(todayKey, 30, timeZone)),
		[setsForType, todayKey, timeZone],
	);

	const accent = et ? resolveExerciseTypeColor(et) : "var(--color-primary)";

	if (!hydrated) {
		return <StatsLoadingSkeleton variant="exercise" />;
	}

	if (!validId || !et || !stats) {
		return (
			<ScreenBody gap="compact">
				<PageHeader
					leading={<PageHeaderBackLink to="/stats" ariaLabel={t("backToStats")} />}
					title={t("exerciseNotFound")}
				/>
			</ScreenBody>
		);
	}

	return (
		<ScreenBody gap="compact">
			<PageHeader
				leading={<PageHeaderBackLink to="/stats" ariaLabel={t("backToStats")} />}
				media={
					<ExerciseTypeIcon
						exerciseType={pickExerciseTypeIconVisual(et)}
						className="size-9 shrink-0"
						style={{ color: accent }}
						aria-hidden
					/>
				}
				title={et.name}
				description={et.archivedAt ? t("archivedBadge") : undefined}
			/>

			<div className="grid gap-3 sm:grid-cols-2">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("exerciseDetailTotalReps")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold tabular-nums">{stats.totalRepsAllTime}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("exerciseDetailTotalSets")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold tabular-nums">{stats.totalSetsAllTime}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("exerciseDetailActiveDays")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold tabular-nums">{stats.activeDaysCount}</p>
					</CardContent>
				</Card>
				{et.trackWeightInSets ? (
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("exerciseDetailMaxWeight")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">
								{maxWeight != null ? formatWeightKgDisplay(maxWeight) : "—"}
							</p>
						</CardContent>
					</Card>
				) : null}
			</div>

			{et.trackWeightInSets ? (
				<div className="grid gap-3 sm:grid-cols-3">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("exerciseTonnageToday")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{formatTonnageWithKgUnit(tonnageToday, locale)}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("exerciseTonnage7d")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{formatTonnageWithKgUnit(tonnage7d, locale)}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("exerciseTonnage30d")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{formatTonnageWithKgUnit(tonnage30d, locale)}</p>
						</CardContent>
					</Card>
				</div>
			) : null}

			<StatsTrendCharts
				sets={setsForType}
				todayKey={todayKey}
				timeZone={timeZone}
				barFill={accent}
				lineStroke="var(--color-secondary)"
			/>
			{et.trackWeightInSets ? (
				<StatsWeightTrendCharts sets={setsForType} todayKey={todayKey} timeZone={timeZone} barFill={accent} />
			) : null}
			{et.trackWeightInSets ? (
				<StatsTonnageTrendCharts sets={setsForType} todayKey={todayKey} timeZone={timeZone} barFill={accent} />
			) : null}
			<StatsHeatmap sets={sets} todayKey={todayKey} timeZone={timeZone} exerciseTypeIdFilter={validId} />
		</ScreenBody>
	);
}
