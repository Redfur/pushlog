import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePushlogStore } from "@/entities/pushup";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import { canLogSetsForDay } from "@/shared/lib/day-key";
import { ExerciseQuickAddBlock } from "@/widgets/main-screen/ui/ExerciseQuickAddBlock";
import { HOME_SCREEN_NS } from "../translations";
import { HomeExerciseList } from "./HomeExerciseList";
import { HomeTodayStatsCards } from "./HomeTodayStatsCards";

export function HomeScreen() {
	const { t } = useTranslation(HOME_SCREEN_NS);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const timeZone = usePushlogStore((s) => s.timeZone);
	const todayKey = useTodayDayKey(timeZone);
	const canLog = canLogSetsForDay(todayKey, timeZone);

	const hasActiveExerciseTypes = useMemo(
		() => Object.values(exerciseTypesById).some((x) => !x.archivedAt),
		[exerciseTypesById],
	);

	if (!hydrated) {
		return (
			<div className="flex flex-col gap-4 py-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-24 w-full rounded-lg" />
				<Skeleton className="h-40 w-full rounded-lg" />
			</div>
		);
	}

	return (
		<div className="animate-in fade-in flex flex-col gap-6 py-4 duration-300">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<h1 className="text-xl font-semibold">{t("title")}</h1>
				<Button type="button" variant="outline" size="sm" asChild>
					<Link to="/day/today">{t("openDayCalendar")}</Link>
				</Button>
			</div>

			<HomeTodayStatsCards todayKey={todayKey} />

			<ExerciseQuickAddBlock
				dayKey={todayKey}
				dayAllowsLogging={canLog}
				hasActiveExerciseTypes={hasActiveExerciseTypes}
			/>

			<div>
				<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
					<h2 className="text-muted-foreground text-sm font-medium">{t("exercisesSection")}</h2>
					<Button type="button" variant="outline" size="sm" asChild>
						<Link to="/exercises/new">{t("addExercise")}</Link>
					</Button>
				</div>
				<HomeExerciseList />
			</div>
		</div>
	);
}
