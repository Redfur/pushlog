import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { filterSetsByDayKey, usePushlogStore } from "@/entities/pushup";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import { canLogSetsForDay, type DayKey, offsetDayKey } from "@/shared/lib/day-key";
import { bcp47FromI18nLang, formatDayKeyFriendly } from "@/shared/lib/format-day";
import { MAIN_SCREEN_NS } from "../translations";
import { DayNavigation } from "./DayNavigation";
import { DayProgress } from "./DayProgress";
import { DaySetsList } from "./DaySetsList";
import { ExerciseQuickAddBlock } from "./ExerciseQuickAddBlock";

type Props = {
	dayKey: DayKey;
};

export function DayScreen({ dayKey }: Props) {
	const { t, i18n } = useTranslation(MAIN_SCREEN_NS);
	const locale = bcp47FromI18nLang(i18n.language);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const sets = usePushlogStore((s) => s.sets);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const timeZone = usePushlogStore((s) => s.timeZone);
	const todayKey = useTodayDayKey(timeZone);
	const yesterdayKey = offsetDayKey(todayKey, -1, timeZone);
	const isToday = dayKey === todayKey;
	const isYesterday = dayKey === yesterdayKey;
	const canLog = canLogSetsForDay(dayKey, timeZone);

	const daySets = useMemo(() => filterSetsByDayKey(sets, dayKey), [sets, dayKey]);

	const hasActiveExerciseTypes = useMemo(
		() => Object.values(exerciseTypesById).some((x) => !x.archivedAt),
		[exerciseTypesById],
	);

	if (!hydrated) {
		return (
			<div className="flex flex-col gap-4 py-4">
				<Skeleton className="h-24 w-full rounded-lg" />
				<Skeleton className="h-32 w-full rounded-lg" />
				<Skeleton className="h-40 w-full rounded-lg" />
			</div>
		);
	}

	return (
		<div className="animate-in fade-in flex flex-col gap-6 py-4 duration-300">
			<h1 className="sr-only">
				{isToday
					? t("title")
					: isYesterday
						? t("titleYesterday")
						: t("titleDay", { date: formatDayKeyFriendly(dayKey, locale) })}
			</h1>
			<DayNavigation dayKey={dayKey} timeZone={timeZone} />
			<DayProgress sets={sets} dayKey={dayKey} isToday={isToday} isYesterday={isYesterday} />
			<ExerciseQuickAddBlock
				dayKey={dayKey}
				dayAllowsLogging={canLog}
				hasActiveExerciseTypes={hasActiveExerciseTypes}
			/>
			<DaySetsList sets={daySets} />
		</div>
	);
}
