import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PushlogSet } from "@/entities/pushup";
import { totalRepsForDay } from "@/entities/pushup";
import { MAIN_SCREEN_NS } from "../translations";

type Props = {
	sets: PushlogSet[];
	dayKey: string;
};

export function DayProgress({ sets, dayKey }: Props) {
	const { t } = useTranslation(MAIN_SCREEN_NS);
	const total = totalRepsForDay(sets, dayKey);

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{t("title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-2xl font-semibold tabular-nums">{t("totalToday", { count: total })}</p>
			</CardContent>
		</Card>
	);
}
