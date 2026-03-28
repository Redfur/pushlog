import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { buildHeatmapGrid, orderedRepsBreakdownForDay, type PushlogSet, usePushlogStore } from "@/entities/pushup";
import { SELECT_EXERCISE_NS } from "@/features/select-exercise";
import type { DayKey } from "@/shared/lib/day-key";
import { bcp47FromI18nLang, formatDayKeyFull } from "@/shared/lib/format-day";
import { cn } from "@/shared/lib/utils";
import { STATS_NS } from "../translations";

const WEEKS = 26;

const HEATMAP_CELL_PX = 14;
const HEATMAP_GAP_PX = 5;
const HEATMAP_LABEL_COL_PX = 36;

const WEEKDAY_ROW_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function weekdayShortMonFirst(locale: string | undefined, weekdayIndex: number): string {
	const d = new Date(2024, 0, 1 + weekdayIndex);
	return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d);
}

function heatClass(reps: number, maxReps: number, isFuture: boolean): string {
	if (isFuture) return "bg-muted/40 ring-1 ring-border/50";
	if (reps <= 0) return "bg-muted";
	const t = maxReps > 0 ? reps / maxReps : 0;
	if (t <= 0.25) return "bg-primary/25";
	if (t <= 0.5) return "bg-primary/45";
	if (t <= 0.75) return "bg-primary/70";
	return "bg-primary";
}

type Props = {
	sets: PushlogSet[];
	todayKey: DayKey;
	timeZone: string;
	/** Если задан — теплокарта и подсказки только по этому типу упражнения. */
	exerciseTypeIdFilter?: string;
};

export function StatsHeatmap({ sets, todayKey, timeZone, exerciseTypeIdFilter }: Props) {
	const { t, i18n } = useTranslation(STATS_NS);
	const { t: tEx } = useTranslation(SELECT_EXERCISE_NS);
	const locale = bcp47FromI18nLang(i18n.language);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);

	const effectiveSets = useMemo(() => {
		if (!exerciseTypeIdFilter) return sets;
		return sets.filter((s) => s.exerciseTypeId === exerciseTypeIdFilter);
	}, [sets, exerciseTypeIdFilter]);

	const cells = useMemo(
		() => buildHeatmapGrid(effectiveSets, todayKey, timeZone, WEEKS),
		[effectiveSets, todayKey, timeZone],
	);

	const maxReps = useMemo(() => {
		let m = 0;
		for (const c of cells) {
			if (c.dayKey && c.reps > m) m = c.reps;
		}
		return m > 0 ? m : 1;
	}, [cells]);

	const gridStyle = {
		gridTemplateColumns: `repeat(${WEEKS}, ${HEATMAP_CELL_PX}px)`,
		gridTemplateRows: `repeat(7, ${HEATMAP_CELL_PX}px)`,
		gap: HEATMAP_GAP_PX,
	} as const;

	const gridHeightPx = 7 * HEATMAP_CELL_PX + 6 * HEATMAP_GAP_PX;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium">{t("heatmapTitle")}</CardTitle>
				<p className="text-muted-foreground text-xs">{t("heatmapWeeks", { count: WEEKS })}</p>
				<p className="text-muted-foreground text-xs">
					{exerciseTypeIdFilter ? t("heatmapSingleExerciseHint") : t("heatmapIntensityHint")}
				</p>
			</CardHeader>
			<CardContent className="space-y-3">
				<TooltipProvider delayDuration={200}>
					<div className="-mx-1 overflow-x-auto overflow-y-hidden px-1">
						<div className="flex w-max items-start" style={{ gap: HEATMAP_GAP_PX }}>
							<div
								className="text-muted-foreground flex shrink-0 flex-col justify-start text-[11px] leading-none"
								style={{
									width: HEATMAP_LABEL_COL_PX,
									height: gridHeightPx,
									gap: HEATMAP_GAP_PX,
									boxSizing: "border-box",
								}}
							>
								{WEEKDAY_ROW_KEYS.map((wk, wd) => (
									<div key={wk} className="flex items-center" style={{ height: HEATMAP_CELL_PX }}>
										{weekdayShortMonFirst(locale, wd)}
									</div>
								))}
							</div>
							<div className="grid shrink-0" style={gridStyle}>
								{Array.from({ length: 7 }, (_, wd) =>
									Array.from({ length: WEEKS }, (_, w) => {
										const cell = cells[w * 7 + wd];
										const isFuture = cell.dayKey === null;
										const breakdown =
											!isFuture && cell.dayKey ? orderedRepsBreakdownForDay(effectiveSets, cell.dayKey) : [];
										const rowKey = WEEKDAY_ROW_KEYS[wd] ?? "d";
										const cellKey = cell.dayKey ?? `empty-${cell.weekIndex}-${rowKey}`;

										return (
											<Tooltip key={cellKey}>
												<TooltipTrigger asChild>
													<button
														type="button"
														className={cn(
															"shrink-0 rounded-[3px] transition-colors",
															heatClass(cell.reps, maxReps, isFuture),
														)}
														style={{
															width: HEATMAP_CELL_PX,
															height: HEATMAP_CELL_PX,
															minWidth: HEATMAP_CELL_PX,
															minHeight: HEATMAP_CELL_PX,
														}}
														aria-label={
															isFuture || !cell.dayKey
																? t("heatmapFuture")
																: t("heatmapDayTooltip", {
																		date: formatDayKeyFull(cell.dayKey, locale),
																		reps: cell.reps,
																	})
														}
													/>
												</TooltipTrigger>
												<TooltipContent side="top" className="max-w-xs">
													{isFuture || !cell.dayKey ? (
														<p>{t("heatmapFuture")}</p>
													) : (
														<div className="space-y-1">
															<p className="font-medium">{formatDayKeyFull(cell.dayKey, locale)}</p>
															<p>{t("heatmapTooltipTotal", { reps: cell.reps })}</p>
															{breakdown.length > 1
																? breakdown.map((b) => {
																		const name = exerciseTypesById[b.exerciseTypeId]?.name ?? tEx("unknownType");
																		return (
																			<p key={b.exerciseTypeId}>{t("heatmapBreakdownLine", { name, reps: b.reps })}</p>
																		);
																	})
																: null}
														</div>
													)}
												</TooltipContent>
											</Tooltip>
										);
									}),
								).flat()}
							</div>
						</div>
					</div>
				</TooltipProvider>
				<div className="text-muted-foreground flex flex-wrap items-center justify-end gap-2 text-xs">
					<span>{t("heatmapLess")}</span>
					<div className="flex" style={{ gap: HEATMAP_GAP_PX }}>
						<span className="rounded-[3px] bg-muted" style={{ width: HEATMAP_CELL_PX, height: HEATMAP_CELL_PX }} />
						<span className="rounded-[3px] bg-primary/25" style={{ width: HEATMAP_CELL_PX, height: HEATMAP_CELL_PX }} />
						<span className="rounded-[3px] bg-primary/45" style={{ width: HEATMAP_CELL_PX, height: HEATMAP_CELL_PX }} />
						<span className="rounded-[3px] bg-primary/70" style={{ width: HEATMAP_CELL_PX, height: HEATMAP_CELL_PX }} />
						<span className="rounded-[3px] bg-primary" style={{ width: HEATMAP_CELL_PX, height: HEATMAP_CELL_PX }} />
					</div>
					<span>{t("heatmapMore")}</span>
				</div>
			</CardContent>
		</Card>
	);
}
