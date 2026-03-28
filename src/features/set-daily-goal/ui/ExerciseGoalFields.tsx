import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePushlogStore } from "@/entities/pushup";
import { SET_DAILY_GOAL_NS } from "../translations";

type Props = {
	exerciseTypeId: string;
	/** Если false — только подсказка, без полей (архив и т.п.). */
	enabled?: boolean;
};

export function ExerciseGoalFields({ exerciseTypeId, enabled = true }: Props) {
	const { t } = useTranslation(SET_DAILY_GOAL_NS);
	const goalsByExercise = usePushlogStore((s) => s.goalsByExercise);
	const setDailyGoal = usePushlogStore((s) => s.setDailyGoal);
	const clearDailyGoal = usePushlogStore((s) => s.clearDailyGoal);

	const [value, setValue] = useState("");

	useEffect(() => {
		const g = goalsByExercise[exerciseTypeId];
		setValue(g ? String(g.targetRepsPerDay) : "");
	}, [exerciseTypeId, goalsByExercise]);

	const handleSave = () => {
		const n = Number.parseInt(value, 10);
		if (Number.isFinite(n) && n > 0) void setDailyGoal(n, exerciseTypeId);
	};

	const currentGoal = goalsByExercise[exerciseTypeId];
	const inputId = `daily-goal-${exerciseTypeId}`;

	if (!enabled) {
		return (
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">{t("sectionTitle")}</CardTitle>
					<CardDescription className="text-xs">{t("goalDisabledArchivedHint")}</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium">{t("sectionTitle")}</CardTitle>
				<CardDescription className="text-xs">{t("singleExerciseHint")}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<label className="text-muted-foreground text-xs" htmlFor={inputId}>
						{t("label")}
					</label>
					<Input
						id={inputId}
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
					{currentGoal ? (
						<Button type="button" variant="outline" onClick={() => void clearDailyGoal(exerciseTypeId)}>
							{t("clear")}
						</Button>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}
