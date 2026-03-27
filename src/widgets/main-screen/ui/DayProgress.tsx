import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PushlogSet } from "@/entities/pushup";
import { totalRepsForDay } from "@/entities/pushup";
import { formatDayKeyLabel } from "@/shared/lib/format-day";
import { MAIN_SCREEN_NS } from "../translations";

type Props = {
	sets: PushlogSet[];
	dayKey: string;
	isToday: boolean;
	isYesterday: boolean;
};

export function DayProgress({ sets, dayKey, isToday, isYesterday }: Props) {
	const { t } = useTranslation(MAIN_SCREEN_NS);
	const total = totalRepsForDay(sets, dayKey);
	const title = isToday
		? t("title")
		: isYesterday
			? t("titleYesterday")
			: t("titleDay", { date: formatDayKeyLabel(dayKey, "ru-RU") });

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-2xl font-semibold tabular-nums">{t("totalToday", { count: total })}</p>
			</CardContent>
		</Card>
	);
}
