import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PushlogSet } from "@/entities/pushup";
import { totalRepsForDay, usePushlogStore } from "@/entities/pushup";
import { DEFAULT_EXERCISE_TYPE_ID } from "@/shared/config/pushlog";
import { bcp47FromI18nLang, formatDayKeyFriendly } from "@/shared/lib/format-day";
import { MAIN_SCREEN_NS } from "../translations";

type Props = {
	sets: PushlogSet[];
	dayKey: string;
	isToday: boolean;
	isYesterday: boolean;
};

export function DayProgress({ sets, dayKey, isToday, isYesterday }: Props) {
	const { t, i18n } = useTranslation(MAIN_SCREEN_NS);
	const locale = bcp47FromI18nLang(i18n.language);
	const goal = usePushlogStore((s) => s.goal);
	const total = totalRepsForDay(sets, dayKey);
	const activeGoal = goal?.exerciseTypeId === DEFAULT_EXERCISE_TYPE_ID ? goal : null;
	const title = isToday
		? t("title")
		: isYesterday
			? t("titleYesterday")
			: t("titleDay", { date: formatDayKeyFriendly(dayKey, locale) });

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<p className="text-2xl font-semibold tabular-nums">
					{activeGoal
						? t("progressTowardGoal", {
								current: total,
								target: activeGoal.targetRepsPerDay,
							})
						: t("totalToday", { count: total })}
				</p>
				{activeGoal ? (
					<Progress value={Math.min(100, (total / activeGoal.targetRepsPerDay) * 100)} className="h-2" />
				) : null}
			</CardContent>
		</Card>
	);
}
