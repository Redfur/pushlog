import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { filterSetsByDayKey, usePushlogStore } from "@/entities/pushup";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import { MAIN_SCREEN_NS } from "../translations";
import { DayProgress } from "./DayProgress";
import { DaySetsList } from "./DaySetsList";
import { QuickAddPanel } from "./QuickAddPanel";

export function MainScreen() {
	const { t } = useTranslation(MAIN_SCREEN_NS);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const sets = usePushlogStore((s) => s.sets);
	const timeZone = usePushlogStore((s) => s.timeZone);
	const todayKey = useTodayDayKey(timeZone);

	const todaySets = useMemo(() => filterSetsByDayKey(sets, todayKey), [sets, todayKey]);

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
			<h1 className="sr-only">{t("title")}</h1>
			<DayProgress sets={sets} dayKey={todayKey} />
			<QuickAddPanel />
			<DaySetsList sets={todaySets} />
		</div>
	);
}
