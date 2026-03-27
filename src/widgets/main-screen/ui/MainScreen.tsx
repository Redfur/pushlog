import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { filterSetsByDayKey, usePushlogStore } from "@/entities/pushup";
import { useAddSet } from "@/features/add-set";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import { canLogSetsForDay, type DayKey, offsetDayKey } from "@/shared/lib/day-key";
import { formatDayKeyLabel } from "@/shared/lib/format-day";
import { MAIN_SCREEN_NS } from "../translations";
import { DayNavigation } from "./DayNavigation";
import { DayProgress } from "./DayProgress";
import { DaySetsList } from "./DaySetsList";
import { QuickAddPanel } from "./QuickAddPanel";

type Props = {
	dayKey: DayKey;
};

export function MainScreen({ dayKey }: Props) {
	const { t } = useTranslation(MAIN_SCREEN_NS);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const sets = usePushlogStore((s) => s.sets);
	const timeZone = usePushlogStore((s) => s.timeZone);
	const todayKey = useTodayDayKey(timeZone);
	const yesterdayKey = offsetDayKey(todayKey, -1, timeZone);
	const isToday = dayKey === todayKey;
	const isYesterday = dayKey === yesterdayKey;
	const canLog = canLogSetsForDay(dayKey, timeZone);

	const { addReps, repeatLast } = useAddSet(dayKey);

	const daySets = useMemo(() => filterSetsByDayKey(sets, dayKey), [sets, dayKey]);

	if (!hydrated) {
		return (
			<div className="flex flex-col gap-4 p-4">
				<Skeleton className="h-24 w-full rounded-lg" />
				<Skeleton className="h-32 w-full rounded-lg" />
				<Skeleton className="h-40 w-full rounded-lg" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 p-4">
			<h1 className="sr-only">
				{isToday
					? t("title")
					: isYesterday
						? t("titleYesterday")
						: t("titleDay", { date: formatDayKeyLabel(dayKey, "ru-RU") })}
			</h1>
			<DayNavigation dayKey={dayKey} timeZone={timeZone} />
			<DayProgress sets={sets} dayKey={dayKey} isToday={isToday} isYesterday={isYesterday} />
			<QuickAddPanel canLog={canLog} addReps={addReps} repeatLast={repeatLast} />
			<DaySetsList sets={daySets} />
		</div>
	);
}
