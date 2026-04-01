import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	computeStats,
	lastNDaysInclusive,
	totalTonnageForDayKey,
	totalTonnageForDayKeys,
	usePushlogStore,
} from "@/entities/pushup";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import { pickExerciseTypeIconVisual, resolveExerciseTypeColor } from "@/shared/config/exercise-type-presets";
import { bcp47FromI18nLang, formatDayKeyFull } from "@/shared/lib/format-day";
import { formatTonnageWithKgUnit } from "@/shared/lib/format-weight-kg";
import { STATS_NS } from "../translations";
import { StatsHeatmap } from "./StatsHeatmap";
import { StatsLoadingSkeleton } from "./StatsLoadingSkeleton";
import { StatsTonnageTrendCharts } from "./StatsTonnageTrendCharts";
import { StatsTrendCharts } from "./StatsTrendCharts";

export function StatsScreen() {
	const { t, i18n } = useTranslation(STATS_NS);
	const locale = bcp47FromI18nLang(i18n.language);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const sets = usePushlogStore((s) => s.sets);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const timeZone = usePushlogStore((s) => s.timeZone);
	const todayKey = useTodayDayKey(timeZone);

	const statsAll = useMemo(() => computeStats(sets, todayKey, timeZone), [sets, timeZone, todayKey]);

	const tonnageToday = useMemo(() => totalTonnageForDayKey(sets, todayKey), [sets, todayKey]);
	const tonnage7d = useMemo(
		() => totalTonnageForDayKeys(sets, lastNDaysInclusive(todayKey, 7, timeZone)),
		[sets, todayKey, timeZone],
	);
	const tonnage30d = useMemo(
		() => totalTonnageForDayKeys(sets, lastNDaysInclusive(todayKey, 30, timeZone)),
		[sets, todayKey, timeZone],
	);

	const typesSorted = useMemo(() => {
		return Object.values(exerciseTypesById).sort((a, b) =>
			a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
		);
	}, [exerciseTypesById]);

	if (!hydrated) {
		return <StatsLoadingSkeleton variant="full" />;
	}

	return (
		<div className="animate-in fade-in flex flex-col gap-4 py-4 duration-300">
			<h1 className="text-xl font-semibold">{t("title")}</h1>

			<div>
				<h2 className="text-muted-foreground mb-2 text-sm font-medium">{t("byExerciseSection")}</h2>
				<p className="text-muted-foreground mb-3 text-xs">{t("byExerciseSectionHint")}</p>
				{typesSorted.length === 0 ? (
					<p className="text-muted-foreground text-sm">{t("noExerciseTypes")}</p>
				) : (
					<ul className="flex flex-col gap-2">
						{typesSorted.map((et) => {
							const color = resolveExerciseTypeColor(et);
							return (
								<li key={et.id}>
									<Link
										to={`/stats/exercise/${et.id}`}
										className="bg-card hover:bg-accent/50 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors"
									>
										<span className="flex min-w-0 items-center gap-2">
											<ExerciseTypeIcon exerciseType={pickExerciseTypeIconVisual(et)} style={{ color }} aria-hidden />
											<span className="min-w-0 truncate font-medium">{et.name}</span>
											{et.archivedAt ? (
												<span className="text-muted-foreground shrink-0 text-xs">{t("archivedBadge")}</span>
											) : null}
										</span>
										<span className="text-muted-foreground shrink-0 text-xs">{t("exerciseStatsLink")}</span>
									</Link>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			<div>
				<h2 className="text-muted-foreground mb-1 text-sm font-medium">{t("generalSection")}</h2>
				<p className="text-muted-foreground mb-3 text-xs">{t("mixedRepsHint")}</p>
				<div className="grid gap-3 sm:grid-cols-2">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("totalReps")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{statsAll.totalRepsAllTime}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("totalSets")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{statsAll.totalSetsAllTime}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("activeDays")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{statsAll.activeDaysCount}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("avgPerDay")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">
								{statsAll.averageRepsPerActiveDay === null ? "—" : statsAll.averageRepsPerActiveDay.toFixed(1)}
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			<div>
				<h2 className="text-muted-foreground mb-1 text-sm font-medium">{t("tonnageSection")}</h2>
				<p className="text-muted-foreground mb-3 text-xs">{t("tonnageSectionHint")}</p>
				<div className="grid gap-3 sm:grid-cols-3">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("tonnageToday")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{formatTonnageWithKgUnit(tonnageToday, locale)}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("tonnage7dCard")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{formatTonnageWithKgUnit(tonnage7d, locale)}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("tonnage30dCard")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{formatTonnageWithKgUnit(tonnage30d, locale)}</p>
						</CardContent>
					</Card>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">{t("bestDay")}</CardTitle>
					<p className="text-muted-foreground text-xs">{t("bestDayMixedHint")}</p>
				</CardHeader>
				<CardContent>
					{statsAll.bestDay ? (
						<p className="text-lg tabular-nums">
							{t("bestDayValue", {
								date: formatDayKeyFull(statsAll.bestDay.dayKey, locale),
								count: statsAll.bestDay.totalReps,
							})}
						</p>
					) : (
						<p className="text-muted-foreground">{t("noData")}</p>
					)}
				</CardContent>
			</Card>

			<StatsTrendCharts sets={sets} todayKey={todayKey} timeZone={timeZone} />
			<StatsTonnageTrendCharts sets={sets} todayKey={todayKey} timeZone={timeZone} />
			<StatsHeatmap sets={sets} todayKey={todayKey} timeZone={timeZone} />
		</div>
	);
}
