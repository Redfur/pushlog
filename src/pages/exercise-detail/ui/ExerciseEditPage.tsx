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
import { ExerciseGoalFields } from "@/features/set-daily-goal";
import { isExerciseTypeUuid } from "@/shared/config/exercise-type-presets";

export function ExerciseEditPage() {
	const { exerciseId: rawParam } = useParams<{ exerciseId: string }>();
	const navigate = useNavigate();
	const { t } = useTranslation(MANAGE_EXERCISES_NS);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const updateExerciseType = usePushlogStore((s) => s.updateExerciseType);

	const validId = rawParam && isExerciseTypeUuid(rawParam) ? rawParam : null;
	const et = validId ? exerciseTypesById[validId] : undefined;

	const [draft, setDraft] = useState<ExerciseTypeDraft>(defaultExerciseTypeDraft);
	const [hexError, setHexError] = useState<string | null>(null);

	useEffect(() => {
		if (et) {
			setDraft(exerciseTypeDraftFromPersisted(et));
			setHexError(null);
		}
	}, [et]);

	async function handleSave() {
		const normalized = normalizeExerciseTypeDraft(draft, t("hexInvalid"));
		if (!normalized.ok) {
			if (normalized.error) setHexError(normalized.error);
			return;
		}
		setHexError(null);
		if (!validId) return;
		const ok = await updateExerciseType(validId, normalized.value);
		if (ok) {
			toast.success(t("toastExerciseSaved"));
			navigate(`/exercises/${validId}`, { replace: true });
		} else {
			toast.error(t("toastExerciseSaveFailed"));
		}
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
				<Button type="button" className="w-fit" onClick={() => void handleSave()}>
					{t("save")}
				</Button>
			</div>

			<ExerciseGoalFields exerciseTypeId={et.id} enabled={!et.archivedAt} />
		</div>
	);
}
