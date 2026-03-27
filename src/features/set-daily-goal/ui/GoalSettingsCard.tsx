import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePushlogStore } from "@/entities/pushup";
import { SET_DAILY_GOAL_NS } from "../translations";

export function GoalSettingsCard() {
	const { t } = useTranslation(SET_DAILY_GOAL_NS);
	const goal = usePushlogStore((s) => s.goal);
	const setDailyGoal = usePushlogStore((s) => s.setDailyGoal);
	const clearDailyGoal = usePushlogStore((s) => s.clearDailyGoal);
	const [value, setValue] = useState(() => (goal ? String(goal.targetRepsPerDay) : ""));

	useEffect(() => {
		setValue(goal ? String(goal.targetRepsPerDay) : "");
	}, [goal]);

	const handleSave = () => {
		const n = Number.parseInt(value, 10);
		if (Number.isFinite(n) && n > 0) void setDailyGoal(n);
	};

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium">{t("sectionTitle")}</CardTitle>
				<CardDescription className="text-xs">{t("hint")}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<label className="text-muted-foreground text-xs" htmlFor="daily-goal-input">
						{t("label")}
					</label>
					<Input
						id="daily-goal-input"
						type="number"
						inputMode="numeric"
						min={1}
						className="tabular-nums"
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
				</div>
				<div className="flex shrink-0 gap-2">
					<Button type="button" onClick={handleSave}>
						{t("save")}
					</Button>
					{goal ? (
						<Button type="button" variant="outline" onClick={() => void clearDailyGoal()}>
							{t("clear")}
						</Button>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}
