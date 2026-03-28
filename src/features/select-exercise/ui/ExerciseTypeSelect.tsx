import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePushlogStore } from "@/entities/pushup";
import { SELECT_EXERCISE_NS } from "../translations";

export function ExerciseTypeSelect() {
	const { t } = useTranslation(SELECT_EXERCISE_NS);
	const preferredExerciseTypeId = usePushlogStore((s) => s.preferredExerciseTypeId);
	const setPreferredExerciseTypeId = usePushlogStore((s) => s.setPreferredExerciseTypeId);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);

	const activeSorted = useMemo(() => {
		return Object.values(exerciseTypesById)
			.filter((x) => !x.archivedAt)
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	}, [exerciseTypesById]);

	if (activeSorted.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-1.5">
			<Label htmlFor="preferred-exercise-type" className="text-muted-foreground text-xs">
				{t("inputLabel")}
			</Label>
			<Select value={preferredExerciseTypeId} onValueChange={setPreferredExerciseTypeId}>
				<SelectTrigger id="preferred-exercise-type" className="w-full max-w-full min-w-0">
					<SelectValue placeholder={t("selectPlaceholder")} />
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
	);
}
