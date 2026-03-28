import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import "@/widgets/stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { computeStatsForExerciseType, usePushlogStore } from "@/entities/pushup";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import {
	isExerciseTypeUuid,
	pickExerciseTypeIconVisual,
	resolveExerciseTypeColor,
} from "@/shared/config/exercise-type-presets";
import { STATS_NS } from "@/widgets/stats/translations";
import { StatsHeatmap } from "@/widgets/stats/ui/StatsHeatmap";
import { StatsTrendCharts } from "@/widgets/stats/ui/StatsTrendCharts";

export function StatsExercisePage() {
	const { exerciseId } = useParams<{ exerciseId: string }>();
	const { t } = useTranslation(STATS_NS);
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

	const accent = et ? resolveExerciseTypeColor(et) : "var(--color-primary)";

	if (!hydrated) {
		return (
			<div className="flex flex-col gap-4 py-4">
				<Skeleton className="h-8 w-56" />
				<div className="grid gap-3 sm:grid-cols-2">
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
				</div>
				<Skeleton className="h-56 w-full rounded-lg" />
			</div>
		);
	}

	if (!validId || !et || !stats) {
		return (
			<div className="animate-in fade-in flex flex-col gap-4 py-4 duration-300">
				<p className="text-muted-foreground text-sm">{t("exerciseNotFound")}</p>
				<Button type="button" variant="outline" className="w-fit" asChild>
					<Link to="/stats">{t("backToStats")}</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="animate-in fade-in flex flex-col gap-4 py-4 duration-300">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex min-w-0 items-center gap-3">
					<ExerciseTypeIcon
						exerciseType={pickExerciseTypeIconVisual(et)}
						className="size-9 shrink-0"
						style={{ color: accent }}
						aria-hidden
					/>
					<div className="min-w-0">
						<h1 className="text-xl font-semibold">{et.name}</h1>
						{et.archivedAt ? <p className="text-muted-foreground text-xs">{t("archivedBadge")}</p> : null}
					</div>
				</div>
				<Button type="button" variant="ghost" size="sm" className="shrink-0" asChild>
					<Link to="/stats">{t("backToStats")}</Link>
				</Button>
			</div>

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
			</div>

			<StatsTrendCharts
				sets={setsForType}
				todayKey={todayKey}
				timeZone={timeZone}
				barFill={accent}
				lineStroke="var(--color-secondary)"
			/>
			<StatsHeatmap sets={sets} todayKey={todayKey} timeZone={timeZone} exerciseTypeIdFilter={validId} />
		</div>
	);
}
