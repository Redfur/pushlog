import { Calendar } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePushlogStore } from "@/entities/pushup";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import { canLogSetsForDay } from "@/shared/lib/day-key";
import { ExerciseQuickAddBlock } from "@/widgets/main-screen/ui/ExerciseQuickAddBlock";
import { PageHeader } from "@/widgets/page-header";
import { HOME_SCREEN_NS } from "../translations";
import { HomeArchivedExercisesSection } from "./HomeArchivedExercisesSection";
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
			<PageHeader
				title={t("title")}
				actions={
					<Button type="button" variant="outline" size="icon" asChild>
						<Link to="/day/today" aria-label={t("openDayCalendar")} title={t("openDayCalendar")}>
							<Calendar className="size-5" />
						</Link>
					</Button>
				}
			/>

			<HomeTodayStatsCards todayKey={todayKey} />

			<ExerciseQuickAddBlock
				dayKey={todayKey}
				dayAllowsLogging={canLog}
				hasActiveExerciseTypes={hasActiveExerciseTypes}
			/>

			<HomeArchivedExercisesSection />
		</div>
	);
}
