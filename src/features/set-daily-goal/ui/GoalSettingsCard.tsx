import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePushlogStore } from "@/entities/pushup";
import { SET_DAILY_GOAL_NS } from "../translations";

export function GoalSettingsCard() {
	const { t } = useTranslation(SET_DAILY_GOAL_NS);
	const goalsByExercise = usePushlogStore((s) => s.goalsByExercise);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const setDailyGoal = usePushlogStore((s) => s.setDailyGoal);
	const clearDailyGoal = usePushlogStore((s) => s.clearDailyGoal);

	const activeSorted = useMemo(() => {
		return Object.values(exerciseTypesById)
			.filter((x) => !x.archivedAt)
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	}, [exerciseTypesById]);

	const firstActiveId = activeSorted[0]?.id ?? "";

	const [goalExerciseTypeId, setGoalExerciseTypeId] = useState("");
	const [value, setValue] = useState("");

	useEffect(() => {
		if (firstActiveId && !goalExerciseTypeId) {
			setGoalExerciseTypeId(firstActiveId);
		}
	}, [firstActiveId, goalExerciseTypeId]);

	useEffect(() => {
		const g = goalsByExercise[goalExerciseTypeId];
		setValue(g ? String(g.targetRepsPerDay) : "");
	}, [goalExerciseTypeId, goalsByExercise]);

	const handleSave = () => {
		const n = Number.parseInt(value, 10);
		if (Number.isFinite(n) && n > 0) void setDailyGoal(n, goalExerciseTypeId);
	};

	const currentGoal = goalsByExercise[goalExerciseTypeId];

	if (activeSorted.length === 0) {
		return (
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">{t("sectionTitle")}</CardTitle>
					<CardDescription className="text-xs">{t("noExercisesHint")}</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium">{t("sectionTitle")}</CardTitle>
				<CardDescription className="text-xs">{t("hint")}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="goal-exercise-type" className="text-muted-foreground text-xs">
						{t("exerciseTypeLabel")}
					</Label>
					<Select value={goalExerciseTypeId || firstActiveId} onValueChange={setGoalExerciseTypeId}>
						<SelectTrigger id="goal-exercise-type" className="w-full max-w-full min-w-0">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{activeSorted.map((def) => (
								<SelectItem key={def.id} value={def.id}>
									{def.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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
						{currentGoal ? (
							<Button type="button" variant="outline" onClick={() => void clearDailyGoal(goalExerciseTypeId)}>
								{t("clear")}
							</Button>
						) : null}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
