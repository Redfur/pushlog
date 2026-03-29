import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildDailyMaxWeightSeries, lastNDaysInclusive, type PushlogSet } from "@/entities/pushup";
import type { DayKey } from "@/shared/lib/day-key";
import { bcp47FromI18nLang, formatDayKeyFull } from "@/shared/lib/format-day";
import { formatWeightKgDisplay } from "@/shared/lib/format-weight-kg";
import { STATS_NS } from "../translations";

type Period = 7 | 30;

const CHART_HEIGHT_PX = 224;

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
	maxWeight: number;
	hasData: boolean;
};

type Props = {
	sets: PushlogSet[];
	todayKey: DayKey;
	timeZone: string;
	barFill?: string;
};

export function StatsWeightTrendCharts({ sets, todayKey, timeZone, barFill }: Props) {
	const { t, i18n } = useTranslation(STATS_NS);
	const [period, setPeriod] = useState<Period>(7);
	const locale = bcp47FromI18nLang(i18n.language);

	const rows = useMemo(() => {
		const keys = lastNDaysInclusive(todayKey, period, timeZone);
		const series = buildDailyMaxWeightSeries(sets, keys);
		return series.map((p): ChartRow => {
			const label = shortDayLabel(p.dayKey, locale);
			const w = p.maxWeight;
			const hasData = w != null && w > 0;
			return {
				dayKey: p.dayKey,
				label,
				maxWeight: hasData && w != null ? w : 0,
				hasData,
			};
		});
	}, [sets, todayKey, timeZone, period, locale]);

	const hasAny = rows.some((r) => r.hasData);
	const barColor = barFill ?? "var(--color-primary)";
	const compact = rows.length > 14;

	return (
		<Card>
			<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
				<CardTitle className="text-sm font-medium">{t("weightTrendsTitle")}</CardTitle>
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
				<p className="text-muted-foreground text-xs">{t("weightTrendsHint")}</p>
				{!hasAny ? (
					<p className="text-muted-foreground text-sm">{t("weightTrendsEmpty")}</p>
				) : (
					<>
						<div className="h-56 w-full min-w-0 shrink-0">
							<ResponsiveContainer width="100%" height={CHART_HEIGHT_PX} minWidth={0}>
								<BarChart data={rows} margin={{ top: 12, right: 8, left: 4, bottom: 4 }} barCategoryGap="12%">
									<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
									<XAxis
										dataKey="label"
										tick={{ fontSize: 10 }}
										interval={compact ? "preserveStartEnd" : 0}
										angle={compact ? -40 : 0}
										textAnchor={compact ? "end" : "middle"}
										height={compact ? 52 : 30}
									/>
									<YAxis tick={{ fontSize: 10 }} width={40} allowDecimals />
									<Tooltip
										content={({ active, payload }) => {
											if (!active || !payload?.length) return null;
											const row = payload[0]?.payload as ChartRow;
											return (
												<div className="bg-popover text-popover-foreground rounded-md border px-2 py-1.5 text-xs shadow-md">
													<p className="font-medium">{formatDayKeyFull(row.dayKey, locale)}</p>
													<p>
														{row.hasData
															? `${t("tooltipMaxWeight")}: ${formatWeightKgDisplay(row.maxWeight, locale)} ${t("weightUnitKg")}`
															: t("weightTrendsNoDay")}
													</p>
												</div>
											);
										}}
									/>
									<Bar dataKey="maxWeight" fill={barColor} fillOpacity={0.85} radius={[3, 3, 0, 0]} maxBarSize={36} />
								</BarChart>
							</ResponsiveContainer>
						</div>
						<div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
							<span className="inline-flex items-center gap-1.5">
								<span
									className="size-2.5 shrink-0 rounded-sm opacity-85"
									style={{ backgroundColor: barColor }}
									aria-hidden
								/>
								{t("chartMaxWeight")}
							</span>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
