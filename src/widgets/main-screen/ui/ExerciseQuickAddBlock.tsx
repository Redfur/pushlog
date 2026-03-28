import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushlogStore } from "@/entities/pushup";
import { useAddSet } from "@/features/add-set";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import { pickExerciseTypeIconVisual, resolveExerciseTypeColor } from "@/shared/config/exercise-type-presets";
import type { DayKey } from "@/shared/lib/day-key";
import { cn } from "@/shared/lib/utils";
import { MAIN_SCREEN_NS } from "../translations";
import { QuickAddPanel } from "./QuickAddPanel";

type Props = {
	dayKey: DayKey;
	dayAllowsLogging: boolean;
	hasActiveExerciseTypes: boolean;
};

export function ExerciseQuickAddBlock({ dayKey, dayAllowsLogging, hasActiveExerciseTypes }: Props) {
	const { t } = useTranslation(MAIN_SCREEN_NS);
	const preferredExerciseTypeId = usePushlogStore((s) => s.preferredExerciseTypeId);
	const setPreferredExerciseTypeId = usePushlogStore((s) => s.setPreferredExerciseTypeId);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);

	const { addReps } = useAddSet(dayKey);
	const allowLog = dayAllowsLogging && hasActiveExerciseTypes;

	const activeSorted = useMemo(() => {
		return Object.values(exerciseTypesById)
			.filter((x) => !x.archivedAt)
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	}, [exerciseTypesById]);

	const selectedEt = preferredExerciseTypeId ? exerciseTypesById[preferredExerciseTypeId] : undefined;
	const selectedName = selectedEt && !selectedEt.archivedAt ? selectedEt.name : activeSorted[0]?.name;
	const effectivePreferredId =
		selectedEt && !selectedEt.archivedAt ? preferredExerciseTypeId : (activeSorted[0]?.id ?? "");

	if (activeSorted.length === 0) {
		return (
			<div className="flex flex-col gap-2">
				{dayAllowsLogging ? (
					<p className="text-muted-foreground text-sm">
						{t("noActiveExercisesHint")}{" "}
						<Link to="/exercises/new" className="text-primary font-medium underline-offset-4 hover:underline">
							{t("noActiveExercisesLink")}
						</Link>
					</p>
				) : null}
			</div>
		);
	}

	return (
		<Card>
			<CardHeader className="border-b border-border/60 pb-4">
				<CardTitle>{t("quickAddCardTitle", { name: selectedName ?? "" })}</CardTitle>
				<CardDescription>{t("quickAddTabsHint")}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 pt-4">
				<div className="flex flex-wrap gap-2" role="tablist" aria-label={t("quickAddTabsAria")}>
					{activeSorted.map((et) => {
						const selected = et.id === effectivePreferredId;
						const accent = resolveExerciseTypeColor(et);
						return (
							<Button
								key={et.id}
								type="button"
								size="icon-lg"
								variant="outline"
								className={cn("size-11 rounded-full", selected && "border-primary bg-accent ring-2 ring-ring/40")}
								aria-pressed={selected}
								aria-label={et.name}
								onClick={() => setPreferredExerciseTypeId(et.id)}
							>
								<ExerciseTypeIcon
									exerciseType={pickExerciseTypeIconVisual(et)}
									className="size-5"
									style={{ color: accent }}
									aria-hidden
								/>
							</Button>
						);
					})}
				</div>
				<QuickAddPanel canAddSet={allowLog} dayAllowsLogging={dayAllowsLogging} addReps={addReps} />
			</CardContent>
		</Card>
	);
}
