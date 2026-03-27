import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { computeStats, usePushlogStore } from "@/entities/pushup";
import { GoalSettingsCard } from "@/features/set-daily-goal";
import { TimezoneSelect } from "@/features/set-timezone";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import { STATS_NS } from "../translations";
import { StatsHeatmap } from "./StatsHeatmap";
import { StatsTrendCharts } from "./StatsTrendCharts";

export function StatsScreen() {
	const { t } = useTranslation(STATS_NS);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const sets = usePushlogStore((s) => s.sets);
	const timeZone = usePushlogStore((s) => s.timeZone);
	const todayKey = useTodayDayKey(timeZone);

	const stats = useMemo(() => computeStats(sets, todayKey, timeZone), [sets, timeZone, todayKey]);

	if (!hydrated) {
		return (
			<div className="flex flex-col gap-4 py-4">
				<Skeleton className="h-8 w-48" />
				<div className="grid gap-3 sm:grid-cols-2">
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
				</div>
				<Skeleton className="h-24 w-full rounded-lg" />
				<Skeleton className="h-56 w-full rounded-lg" />
			</div>
		);
	}

	return (
		<div className="animate-in fade-in flex flex-col gap-4 py-4 duration-300">
			<h1 className="text-xl font-semibold">{t("title")}</h1>

			<TimezoneSelect />

			<GoalSettingsCard />

			<div className="grid gap-3 sm:grid-cols-2">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("totalReps")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold tabular-nums">{stats.totalRepsAllTime}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("totalSets")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold tabular-nums">{stats.totalSetsAllTime}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("activeDays")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold tabular-nums">{stats.activeDaysCount}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("avgPerDay")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold tabular-nums">
							{stats.averageRepsPerActiveDay === null ? "—" : stats.averageRepsPerActiveDay.toFixed(1)}
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">{t("bestDay")}</CardTitle>
				</CardHeader>
				<CardContent>
					{stats.bestDay ? (
						<p className="text-lg tabular-nums">
							{t("bestDayValue", {
								date: stats.bestDay.dayKey,
								count: stats.bestDay.totalReps,
							})}
						</p>
					) : (
						<p className="text-muted-foreground">{t("noData")}</p>
					)}
				</CardContent>
			</Card>

			<StatsTrendCharts sets={sets} todayKey={todayKey} timeZone={timeZone} />
			<StatsHeatmap sets={sets} todayKey={todayKey} timeZone={timeZone} />
		</div>
	);
}
