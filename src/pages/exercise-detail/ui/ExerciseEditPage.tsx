import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
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
import { PageHeader, PageHeaderBackLink, PageHeaderSkeleton } from "@/widgets/page-header";

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
				<PageHeaderSkeleton showMedia={false} />
				<Skeleton className="h-40 w-full rounded-lg" />
			</div>
		);
	}

	if (!validId || !et) {
		return (
			<div className="flex flex-col gap-4 py-4">
				<PageHeader leading={<PageHeaderBackLink to="/" ariaLabel={t("backHome")} />} title={t("exerciseNotFound")} />
			</div>
		);
	}

	return (
		<div className="animate-in fade-in flex flex-col gap-6 py-4 duration-300">
			<PageHeader
				leading={<PageHeaderBackLink to={`/exercises/${et.id}`} ariaLabel={t("backToExercise")} />}
				title={t("editPageTitle")}
			/>

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
				</div>
			</form>
		</div>
	);
}
