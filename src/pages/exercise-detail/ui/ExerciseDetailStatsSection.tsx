import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTonnageMassDisplay } from "@/shared/lib/format-weight-kg";
import { cn } from "@/shared/lib/utils";

type TFunction = (key: string) => string;

type Props = {
	t: TFunction;
	language: string;
	trackWeightInSets: boolean;
	todaySetCount: number;
	todayReps: number;
	todayTonnage: number;
	totalRepsAllTime: number;
	totalSetsAllTime: number;
	activeDaysCount: number;
	allTimeTonnage: number | null;
};

export function ExerciseDetailStatsSection({
	t,
	language,
	trackWeightInSets,
	todaySetCount,
	todayReps,
	todayTonnage,
	totalRepsAllTime,
	totalSetsAllTime,
	activeDaysCount,
	allTimeTonnage,
}: Props) {
	return (
		<div className="flex flex-col gap-4">
			<div>
				<h2 className="text-muted-foreground mb-2 text-sm font-medium">{t("viewTodayTitle")}</h2>
				<div className={cn("grid gap-3", trackWeightInSets ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2")}>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("viewCardSets")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{todaySetCount}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("viewCardReps")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{todayReps}</p>
						</CardContent>
					</Card>
					{trackWeightInSets ? (
						<Card className="sm:col-span-2 lg:col-span-1">
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium">{t("viewCardTonnageToday")}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-semibold tabular-nums">
									{formatTonnageMassDisplay(todayTonnage, language)}
								</p>
							</CardContent>
						</Card>
					) : null}
				</div>
			</div>
			<div>
				<h2 className="text-muted-foreground mb-2 text-sm font-medium">{t("viewAllTimeTitle")}</h2>
				<div className="grid gap-3 sm:grid-cols-2">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("viewCardReps")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{totalRepsAllTime}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("viewCardSets")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{totalSetsAllTime}</p>
						</CardContent>
					</Card>
					{trackWeightInSets ? (
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium">{t("viewCardTonnageAllTime")}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-semibold tabular-nums">
									{formatTonnageMassDisplay(allTimeTonnage ?? 0, language)}
								</p>
							</CardContent>
						</Card>
					) : null}
					<Card className={trackWeightInSets ? undefined : "sm:col-span-2"}>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">{t("viewCardActiveDays")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold tabular-nums">{activeDaysCount}</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
