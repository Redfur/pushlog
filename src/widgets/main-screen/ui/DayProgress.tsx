import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PushlogSet } from "@/entities/pushup";
import { filterSetsByDayKey, totalRepsForDayAndExercise, usePushlogStore } from "@/entities/pushup";
import { SELECT_EXERCISE_NS } from "@/features/select-exercise";
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
	const { t: tEx } = useTranslation(SELECT_EXERCISE_NS);
	const locale = bcp47FromI18nLang(i18n.language);
	const goalsByExercise = usePushlogStore((s) => s.goalsByExercise);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);

	const daySlice = useMemo(() => filterSetsByDayKey(sets, dayKey), [sets, dayKey]);
	const totalEntries = daySlice.length;

	const typeOrder = useMemo(() => {
		const repsByType = new Map<string, number>();
		for (const s of daySlice) {
			repsByType.set(s.exerciseTypeId, (repsByType.get(s.exerciseTypeId) ?? 0) + s.reps);
		}
		const ids = new Set<string>();
		for (const t of Object.values(exerciseTypesById)) ids.add(t.id);
		for (const id of Object.keys(goalsByExercise)) ids.add(id);
		for (const id of repsByType.keys()) ids.add(id);

		return [...ids]
			.filter((id) => (repsByType.get(id) ?? 0) > 0 || goalsByExercise[id] != null)
			.sort((a, b) => {
				const na = exerciseTypesById[a]?.name ?? a;
				const nb = exerciseTypesById[b]?.name ?? b;
				return na.localeCompare(nb, undefined, { sensitivity: "base" });
			});
	}, [daySlice, goalsByExercise, exerciseTypesById]);

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
			<CardContent className="space-y-4">
				{typeOrder.length === 0 ? (
					<p className="text-muted-foreground text-sm">{t("emptyDayProgress")}</p>
				) : (
					<>
						{totalEntries > 0 ? (
							<p className="text-muted-foreground text-xs">{t("totalEntriesLine", { count: totalEntries })}</p>
						) : null}
						<div className="flex flex-col gap-4">
							{typeOrder.map((typeId) => {
								const reps = totalRepsForDayAndExercise(sets, dayKey, typeId);
								const goal = goalsByExercise[typeId];
								const et = exerciseTypesById[typeId];
								const name = et?.name ?? tEx("unknownType");

								return (
									<div key={typeId} className="space-y-2">
										{goal ? (
											<>
												<p className="text-lg font-semibold tabular-nums">
													{t("progressTypeGoal", {
														name,
														current: reps,
														target: goal.targetRepsPerDay,
													})}
												</p>
												<Progress value={Math.min(100, (reps / goal.targetRepsPerDay) * 100)} className="h-2" />
											</>
										) : (
											<p className="text-lg font-semibold tabular-nums">{t("progressTypeLine", { name, reps })}</p>
										)}
									</div>
								);
							})}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
