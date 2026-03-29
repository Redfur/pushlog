import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lastNDaysInclusive, type PushlogSet, totalTonnageForDayKey, totalTonnageForDayKeys } from "@/entities/pushup";
import type { DayKey } from "@/shared/lib/day-key";
import { formatTonnageWithKgUnit } from "@/shared/lib/format-weight-kg";
import { MAIN_SCREEN_NS } from "../translations";

type Props = {
	sets: PushlogSet[];
	/** Просматриваемый день (карточка «за этот день»). */
	dayKey: DayKey;
	todayKey: DayKey;
	timeZone: string;
};

export function DayTonnageCards({ sets, dayKey, todayKey, timeZone }: Props) {
	const { t, i18n } = useTranslation(MAIN_SCREEN_NS);
	const locale = i18n.language;

	const { forViewedDay, last7, last30 } = useMemo(() => {
		const keys7 = lastNDaysInclusive(todayKey, 7, timeZone);
		const keys30 = lastNDaysInclusive(todayKey, 30, timeZone);
		return {
			forViewedDay: totalTonnageForDayKey(sets, dayKey),
			last7: totalTonnageForDayKeys(sets, keys7),
			last30: totalTonnageForDayKeys(sets, keys30),
		};
	}, [sets, dayKey, todayKey, timeZone]);

	return (
		<div className="flex flex-col gap-2">
			<h2 className="text-muted-foreground text-sm font-medium">{t("dayTonnageSection")}</h2>
			<p className="text-muted-foreground text-xs">{t("dayTonnageHint")}</p>
			<div className="grid gap-3 sm:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("tonnageThisDay")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold tabular-nums">{formatTonnageWithKgUnit(forViewedDay, locale)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("tonnageLast7d")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold tabular-nums">{formatTonnageWithKgUnit(last7, locale)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">{t("tonnageLast30d")}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold tabular-nums">{formatTonnageWithKgUnit(last30, locale)}</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
