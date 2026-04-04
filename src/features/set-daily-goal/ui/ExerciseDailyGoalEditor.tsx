import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SET_DAILY_GOAL_NS } from "../translations";

type DescriptionHintKey = "singleExerciseHint" | "optionalHint";

type Props = {
	value: string;
	onChange: (value: string) => void;
	inputId: string;
	/** Для архивного типа — только подсказка без поля. */
	enabled?: boolean;
	descriptionHint?: DescriptionHintKey;
};

export function ExerciseDailyGoalEditor({
	value,
	onChange,
	inputId,
	enabled = true,
	descriptionHint = "singleExerciseHint",
}: Props) {
	const { t } = useTranslation(SET_DAILY_GOAL_NS);

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
				<CardDescription className="text-xs">{t(descriptionHint)}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex min-w-0 flex-col gap-1.5">
					<label className="text-muted-foreground text-xs" htmlFor={inputId}>
						{t("label")}
					</label>
					<Input
						id={inputId}
						type="number"
						inputMode="numeric"
						min={1}
						className="max-w-xs tabular-nums"
						value={value}
						onChange={(e) => onChange(e.target.value)}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
