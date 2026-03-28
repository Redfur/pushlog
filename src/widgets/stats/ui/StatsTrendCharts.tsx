import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildDailyActivitySeries, lastNDaysInclusive, type PushlogSet } from "@/entities/pushup";
import type { DayKey } from "@/shared/lib/day-key";
import { bcp47FromI18nLang, formatDayKeyFull } from "@/shared/lib/format-day";
import { STATS_NS } from "../translations";

type Period = 7 | 30;

const TREND_CHART_HEIGHT_PX = 224;

function shortDayLabel(dayKey: DayKey, locale: string | undefined): string {
	const [y, m, d] = dayKey.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	return new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "numeric",
	}).format(date);
}

type ChartRow = {
	dayKey: DayKey;
	label: string;
	reps: number;
	setCount: number;
};

type Props = {
	sets: PushlogSet[];
	todayKey: DayKey;
	timeZone: string;
	/** Цвет столбцов повторений (например акцент типа упражнения). */
	barFill?: string;
	/** Цвет линии подходов. */
	lineStroke?: string;
};

export function StatsTrendCharts({ sets, todayKey, timeZone, barFill, lineStroke }: Props) {
	const { t, i18n } = useTranslation(STATS_NS);
	const [period, setPeriod] = useState<Period>(7);
	const locale = bcp47FromI18nLang(i18n.language);

	const rows = useMemo(() => {
		const keys = lastNDaysInclusive(todayKey, period, timeZone);
		return keys.map((dayKey): ChartRow => {
			const label = shortDayLabel(dayKey, locale);
			const series = buildDailyActivitySeries(sets, [dayKey]);
			const s0 = series[0];
			return {
				dayKey,
				label,
				reps: s0?.reps ?? 0,
				setCount: s0?.setCount ?? 0,
			};
		});
	}, [sets, todayKey, timeZone, period, locale]);

	const hasAny = rows.some((r) => r.reps > 0 || r.setCount > 0);
	const barColor = barFill ?? "var(--color-primary)";
	const lineColor = lineStroke ?? "var(--color-secondary)";

	return (
		<Card>
			<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
				<CardTitle className="text-sm font-medium">{t("trendsTitle")}</CardTitle>
				<div className="flex gap-1">
					<Button
						type="button"
						variant={period === 7 ? "default" : "outline"}
						size="sm"
						className="h-8"
						onClick={() => setPeriod(7)}
					>
						{t("period7d")}
					</Button>
					<Button
						type="button"
						variant={period === 30 ? "default" : "outline"}
						size="sm"
						className="h-8"
						onClick={() => setPeriod(30)}
					>
						{t("period30d")}
					</Button>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<p className="text-muted-foreground text-xs">{t("trendsOverviewHint")}</p>
				{!hasAny ? (
					<p className="text-muted-foreground text-sm">{t("trendsEmpty")}</p>
				) : (
					<>
						<div className="h-56 w-full min-w-0 shrink-0">
							<ResponsiveContainer width="100%" height={TREND_CHART_HEIGHT_PX} minWidth={0}>
								<ComposedChart data={rows} margin={{ top: 12, right: 8, left: 4, bottom: 4 }} barCategoryGap="12%">
									<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
									<XAxis
										dataKey="label"
										tick={{ fontSize: 10 }}
										interval={period === 30 ? "preserveStartEnd" : 0}
										angle={period === 30 ? -40 : 0}
										textAnchor={period === 30 ? "end" : "middle"}
										height={period === 30 ? 52 : 30}
									/>
									<YAxis yAxisId="reps" allowDecimals={false} tick={{ fontSize: 10 }} width={32} />
									<YAxis yAxisId="sets" orientation="right" allowDecimals={false} tick={{ fontSize: 10 }} width={32} />
									<Tooltip
										content={({ active, payload }) => {
											if (!active || !payload?.length) return null;
											const row = payload[0]?.payload as ChartRow;
											return (
												<div className="bg-popover text-popover-foreground rounded-md border px-2 py-1.5 text-xs shadow-md">
													<p className="font-medium">{formatDayKeyFull(row.dayKey, locale)}</p>
													<p>
														{t("tooltipReps")}: {row.reps}
													</p>
													<p>
														{t("tooltipSets")}: {row.setCount}
													</p>
												</div>
											);
										}}
									/>
									<Bar
										yAxisId="reps"
										dataKey="reps"
										fill={barColor}
										fillOpacity={0.85}
										radius={[3, 3, 0, 0]}
										maxBarSize={36}
									/>
									<Line
										yAxisId="sets"
										type="monotone"
										dataKey="setCount"
										name="setCount"
										stroke={lineColor}
										strokeWidth={2}
										dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
										activeDot={{ r: 4 }}
										connectNulls
									/>
								</ComposedChart>
							</ResponsiveContainer>
						</div>
						<div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
							<span className="inline-flex items-center gap-1.5">
								<span
									className="size-2.5 shrink-0 rounded-sm opacity-85"
									style={{ backgroundColor: barColor }}
									aria-hidden
								/>
								{t("tooltipReps")}
							</span>
							<span className="inline-flex items-center gap-1.5">
								<span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: lineColor }} aria-hidden />
								{t("tooltipSets")}
							</span>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
