import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePushlogStore } from "@/entities/pushup";
import {
	defaultExerciseTypeDraft,
	type ExerciseTypeDraft,
	ExerciseTypeEditorFields,
	exerciseTypeDraftFromPersisted,
	MANAGE_EXERCISES_NS,
	normalizeExerciseTypeDraft,
} from "@/features/manage-exercises";
import { ExerciseDailyGoalEditor, parseDailyGoalInput, SET_DAILY_GOAL_NS } from "@/features/set-daily-goal";
import { isExerciseTypeUuid } from "@/shared/config/exercise-type-presets";

export function ExerciseEditPage() {
	const { exerciseId: rawParam } = useParams<{ exerciseId: string }>();
	const navigate = useNavigate();
	const { t } = useTranslation(MANAGE_EXERCISES_NS);
	const { t: tGoal } = useTranslation(SET_DAILY_GOAL_NS);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const updateExerciseType = usePushlogStore((s) => s.updateExerciseType);
	const setDailyGoal = usePushlogStore((s) => s.setDailyGoal);
	const clearDailyGoal = usePushlogStore((s) => s.clearDailyGoal);

	const validId = rawParam && isExerciseTypeUuid(rawParam) ? rawParam : null;
	const et = validId ? exerciseTypesById[validId] : undefined;

	const [draft, setDraft] = useState<ExerciseTypeDraft>(defaultExerciseTypeDraft);
	const [hexError, setHexError] = useState<string | null>(null);

	useEffect(() => {
		if (!hydrated || !validId) return;
		const row = usePushlogStore.getState().exerciseTypesById[validId];
		if (!row) return;
		const g = usePushlogStore.getState().goalsByExercise[validId];
		setDraft({
			...exerciseTypeDraftFromPersisted(row),
			dailyGoalInput: g != null ? String(g.targetRepsPerDay) : "",
		});
		setHexError(null);
	}, [hydrated, validId]);

	async function handleSave() {
		const parsedGoal = parseDailyGoalInput(draft.dailyGoalInput);
		if (parsedGoal.kind === "invalid") {
			toast.error(tGoal("goalInputInvalid"));
			return;
		}

		const normalized = normalizeExerciseTypeDraft(draft, t("hexInvalid"));
		if (!normalized.ok) {
			if (normalized.error) setHexError(normalized.error);
			return;
		}
		setHexError(null);
		if (!validId) return;

		const ok = await updateExerciseType(validId, normalized.value);
		if (!ok) {
			toast.error(t("toastExerciseSaveFailed"));
			return;
		}

		if (et && !et.archivedAt) {
			const hadGoal = validId in usePushlogStore.getState().goalsByExercise;
			if (parsedGoal.kind === "empty") {
				if (hadGoal) await clearDailyGoal(validId);
			} else {
				await setDailyGoal(parsedGoal.reps, validId);
			}
			const err = usePushlogStore.getState().lastError;
			if (err) {
				toast.error(tGoal("toastGoalPersistFailed"));
				return;
			}
		}

		toast.success(t("toastExerciseSaved"));
		navigate(`/exercises/${validId}`, { replace: true });
	}

	if (!hydrated) {
		return (
			<div className="flex flex-col gap-4 py-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-40 w-full rounded-lg" />
			</div>
		);
	}

	if (!validId || !et) {
		return (
			<div className="flex flex-col gap-4 py-4">
				<p className="text-muted-foreground text-sm">{t("exerciseNotFound")}</p>
				<Button type="button" variant="outline" className="w-fit" asChild>
					<Link to="/">{t("backHome")}</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="animate-in fade-in flex flex-col gap-6 py-4 duration-300">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-xl font-semibold">{t("editPageTitle")}</h1>
				<Button type="button" variant="outline" size="sm" asChild>
					<Link to={`/exercises/${et.id}`}>{t("backToExercise")}</Link>
				</Button>
			</div>

			<form
				className="flex flex-col gap-6"
				onSubmit={(e) => {
					e.preventDefault();
					void handleSave();
				}}
			>
				<div className="flex flex-col gap-4">
					<ExerciseTypeEditorFields
						draft={draft}
						onDraftChange={setDraft}
						hexError={hexError}
						onHexErrorClear={() => setHexError(null)}
						t={t}
						nameInputId="ex-edit-name"
						iconSelectId="ex-edit-icon"
						trackWeightSwitchId="ex-edit-track-weight"
					/>
					<ExerciseDailyGoalEditor
						value={draft.dailyGoalInput}
						onChange={(v) => setDraft((d) => ({ ...d, dailyGoalInput: v }))}
						inputId="ex-edit-daily-goal"
						enabled={!et.archivedAt}
					/>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
					<Button type="submit">{t("save")}</Button>
					<Button type="button" variant="outline" asChild>
						<Link to={`/exercises/${et.id}`}>{t("backToExercise")}</Link>
					</Button>
				</div>
			</form>
		</div>
	);
}
