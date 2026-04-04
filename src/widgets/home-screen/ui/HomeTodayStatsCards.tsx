import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { filterSetsByDayKey, totalTonnageForDayKey, usePushlogStore } from "@/entities/pushup";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import { pickExerciseTypeIconVisual, resolveExerciseTypeColor } from "@/shared/config/exercise-type-presets";
import { formatTonnageWithKgUnit } from "@/shared/lib/format-weight-kg";
import { HOME_SCREEN_NS } from "../translations";

type Props = {
	todayKey: string;
};

export function HomeTodayStatsCards({ todayKey }: Props) {
	const { t, i18n } = useTranslation(HOME_SCREEN_NS);
	const sets = usePushlogStore((s) => s.sets);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);

	const daySets = useMemo(() => filterSetsByDayKey(sets, todayKey), [sets, todayKey]);
	const totalReps = useMemo(() => daySets.reduce((a, s) => a + s.reps, 0), [daySets]);
	const totalSetCount = daySets.length;

	const activeSorted = useMemo(() => {
		return Object.values(exerciseTypesById)
			.filter((x) => !x.archivedAt)
			.sort((a, b) => a.name.localeCompare(b.name, "ru"));
	}, [exerciseTypesById]);

	const repsSetsByTypeId = useMemo(() => {
		const map = new Map<string, { reps: number; sets: number }>();
		for (const s of daySets) {
			const cur = map.get(s.exerciseTypeId) ?? { reps: 0, sets: 0 };
			cur.reps += s.reps;
			cur.sets += 1;
			map.set(s.exerciseTypeId, cur);
		}
		return map;
	}, [daySets]);

	return (
		<div>
			<h2 className="text-muted-foreground mb-2 text-sm font-medium">{t("todaySummaryTitle")}</h2>
			<div className="grid gap-3 sm:grid-cols-2">
				<Card className="sm:col-span-2">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">
							{t("todayAllTypesCardTitle")}
							<span className="ml-2 text-muted-foreground text-xs font-normal">{t("cardLabelToday")}</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-3 sm:grid-cols-2">
						<div>
							<p className="text-muted-foreground text-xs">{t("cardSets")}</p>
							<p className="text-2xl font-semibold tabular-nums">{totalSetCount}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">{t("cardReps")}</p>
							<p className="text-2xl font-semibold tabular-nums">{totalReps}</p>
						</div>
					</CardContent>
				</Card>

				{activeSorted.map((et) => {
					const agg = repsSetsByTypeId.get(et.id) ?? { reps: 0, sets: 0 };
					const accent = resolveExerciseTypeColor(et);
					const tonnageKg = et.trackWeightInSets
						? totalTonnageForDayKey(
								daySets.filter((s) => s.exerciseTypeId === et.id),
								todayKey,
							)
						: null;
					return (
						<Link key={et.id} to={`/exercises/${et.id}`} className="block h-full min-h-0">
							<Card className="hover:bg-accent/40 flex h-full flex-col transition-colors">
								<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
									<ExerciseTypeIcon
										exerciseType={pickExerciseTypeIconVisual(et)}
										className="size-5 shrink-0"
										style={{ color: accent }}
										aria-hidden
									/>
									<CardTitle className="truncate text-sm font-medium">
										{et.name}
										<span className="ml-2 text-muted-foreground text-xs font-normal">{t("cardLabelToday")}</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-x-4">
									<div className="min-w-0">
										<p className="text-muted-foreground text-xs leading-tight">{t("cardSets")}</p>
										<p className="text-2xl font-semibold tabular-nums">{agg.sets}</p>
									</div>
									<div className="min-w-0">
										<p className="text-muted-foreground text-xs leading-tight">{t("cardReps")}</p>
										<p className="text-2xl font-semibold tabular-nums">{agg.reps}</p>
									</div>
									<div className="min-w-0">
										<p className="text-muted-foreground text-xs leading-tight">{t("cardTonnage")}</p>
										<p className="text-2xl font-semibold tabular-nums">
											{tonnageKg != null ? (
												formatTonnageWithKgUnit(tonnageKg, i18n.language)
											) : (
												<>
													<span className="sr-only">{t("cardTonnageDashAria")}</span>
													<span className="text-muted-foreground font-normal" aria-hidden>
														—
													</span>
												</>
											)}
										</p>
									</div>
								</CardContent>
							</Card>
						</Link>
					);
				})}

				<Link to="/exercises/new" className="block h-full min-h-0">
					<Card className="hover:bg-accent/40 flex h-full min-h-[8rem] flex-col items-center justify-center gap-2 border-dashed transition-colors">
						<CardContent className="flex flex-col items-center justify-center gap-2 py-6">
							<Plus className="text-muted-foreground size-8 shrink-0" aria-hidden />
							<p className="text-muted-foreground text-center text-sm font-medium">{t("addExercise")}</p>
						</CardContent>
					</Card>
				</Link>
			</div>
		</div>
	);
}
