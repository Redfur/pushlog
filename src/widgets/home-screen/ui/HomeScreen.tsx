import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { filterSetsByDayKey, usePushlogStore } from "@/entities/pushup";
import { useAddSet } from "@/features/add-set";
import { ExerciseTypeSelect } from "@/features/select-exercise";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import { canLogSetsForDay } from "@/shared/lib/day-key";
import { MAIN_SCREEN_NS } from "@/widgets/main-screen";
import { QuickAddPanel } from "@/widgets/main-screen/ui/QuickAddPanel";
import { HOME_SCREEN_NS } from "../translations";
import { HomeExerciseList } from "./HomeExerciseList";

export function HomeScreen() {
	const { t } = useTranslation(HOME_SCREEN_NS);
	const { t: tMain } = useTranslation(MAIN_SCREEN_NS);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const sets = usePushlogStore((s) => s.sets);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const timeZone = usePushlogStore((s) => s.timeZone);
	const todayKey = useTodayDayKey(timeZone);
	const canLog = canLogSetsForDay(todayKey, timeZone);

	const { addReps, repeatLast } = useAddSet(todayKey);

	const daySets = useMemo(() => filterSetsByDayKey(sets, todayKey), [sets, todayKey]);
	const totalRepsToday = useMemo(() => daySets.reduce((a, s) => a + s.reps, 0), [daySets]);

	const hasActiveExerciseTypes = useMemo(
		() => Object.values(exerciseTypesById).some((x) => !x.archivedAt),
		[exerciseTypesById],
	);

	const allowLog = canLog && hasActiveExerciseTypes;

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

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">{t("todaySummaryTitle")}</CardTitle>
					<CardDescription className="text-xs">{t("todayRepsMixedHint")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-1 text-sm tabular-nums">
					<p>
						<span className="text-muted-foreground">{t("todayTotalSetsLabel")}: </span>
						<span className="font-semibold">{daySets.length}</span>
					</p>
					<p>
						<span className="text-muted-foreground">{t("todayTotalRepsLabel")}: </span>
						<span className="font-semibold">{totalRepsToday}</span>
					</p>
				</CardContent>
			</Card>

			<div className="flex flex-col gap-2">
				<p className="text-muted-foreground text-xs">{t("chooseForLogHint")}</p>
				<ExerciseTypeSelect />
				{canLog && !hasActiveExerciseTypes ? (
					<p className="text-muted-foreground text-sm">
						{tMain("noActiveExercisesHint")}{" "}
						<Link to="/exercises/new" className="text-primary font-medium underline-offset-4 hover:underline">
							{tMain("noActiveExercisesLink")}
						</Link>
					</p>
				) : null}
			</div>

			<div className="flex flex-col gap-3">
				<p className="text-muted-foreground text-sm">{tMain("quickAdd")}</p>
				<QuickAddPanel canAddSet={allowLog} dayAllowsLogging={canLog} addReps={addReps} repeatLast={repeatLast} />
			</div>

			<div>
				<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
					<h2 className="text-muted-foreground text-sm font-medium">{t("exercisesSection")}</h2>
					<Button type="button" variant="outline" size="sm" asChild>
						<Link to="/exercises/new">{t("addExercise")}</Link>
					</Button>
				</div>
				<HomeExerciseList todayKey={todayKey} />
			</div>
		</div>
	);
}
