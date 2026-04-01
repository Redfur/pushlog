import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	computeStatsForExerciseType,
	filterSetsByDayKey,
	totalTonnageForDayKey,
	totalTonnageForExerciseType,
	usePushlogStore,
} from "@/entities/pushup";
import {
	defaultExerciseTypeDraft,
	type ExerciseTypeDraft,
	ExerciseTypeEditorFields,
	MANAGE_EXERCISES_NS,
	normalizeExerciseTypeDraft,
} from "@/features/manage-exercises";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import {
	isExerciseTypeUuid,
	pickExerciseTypeIconVisual,
	resolveExerciseTypeColor,
} from "@/shared/config/exercise-type-presets";
import { ExerciseDeleteDialog } from "./ExerciseDeleteDialog";
import { ExerciseDetailStatsSection } from "./ExerciseDetailStatsSection";
import { ExercisePageSkeleton } from "./ExercisePageSkeleton";

export function ExercisePage() {
	const loc = useLocation();
	const { exerciseId: paramId } = useParams<{ exerciseId?: string }>();
	const rawParam = paramId ?? (loc.pathname === "/exercises/new" ? "new" : undefined);
	const navigate = useNavigate();
	const { t, i18n } = useTranslation(MANAGE_EXERCISES_NS);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const sets = usePushlogStore((s) => s.sets);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const addExerciseType = usePushlogStore((s) => s.addExerciseType);
	const archiveExerciseType = usePushlogStore((s) => s.archiveExerciseType);
	const unarchiveExerciseType = usePushlogStore((s) => s.unarchiveExerciseType);
	const deleteExerciseType = usePushlogStore((s) => s.deleteExerciseType);
	const timeZone = usePushlogStore((s) => s.timeZone);
	const todayKey = useTodayDayKey(timeZone);

	const isNew = rawParam === "new";
	const validId = rawParam && !isNew && isExerciseTypeUuid(rawParam) ? rawParam : null;
	const et = validId ? exerciseTypesById[validId] : undefined;

	const [draft, setDraft] = useState<ExerciseTypeDraft>(defaultExerciseTypeDraft);
	const [hexError, setHexError] = useState<string | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	useEffect(() => {
		if (isNew) {
			setDraft(defaultExerciseTypeDraft());
			setHexError(null);
			return;
		}
	}, [isNew]);

	const statsAll = useMemo(
		() => (validId ? computeStatsForExerciseType(sets, validId, todayKey, timeZone) : null),
		[sets, validId, todayKey, timeZone],
	);

	const todaySetsForType = useMemo(() => {
		if (!validId) return [];
		return filterSetsByDayKey(sets, todayKey).filter((s) => s.exerciseTypeId === validId);
	}, [sets, validId, todayKey]);

	const todayReps = useMemo(() => todaySetsForType.reduce((a, s) => a + s.reps, 0), [todaySetsForType]);
	const todaySetCount = todaySetsForType.length;
	const todayTonnage = useMemo(() => totalTonnageForDayKey(todaySetsForType, todayKey), [todaySetsForType, todayKey]);

	const allTimeTonnage = useMemo(() => {
		if (!validId) return null;
		const typeRow = exerciseTypesById[validId];
		if (!typeRow?.trackWeightInSets) return null;
		return totalTonnageForExerciseType(sets, validId);
	}, [sets, validId, exerciseTypesById]);

	async function handleSaveNew() {
		const normalized = normalizeExerciseTypeDraft(draft, t("hexInvalid"));
		if (!normalized.ok) {
			if (normalized.error) setHexError(normalized.error);
			return;
		}
		setHexError(null);
		const id = await addExerciseType(normalized.value);
		if (id) navigate(`/exercises/${id}`, { replace: true });
	}

	if (!hydrated) {
		return <ExercisePageSkeleton />;
	}

	if (isNew) {
		return (
			<div className="animate-in fade-in flex flex-col gap-6 py-4 duration-300">
				<h1 className="text-xl font-semibold">{t("newPageTitle")}</h1>
				<ExerciseTypeEditorFields
					draft={draft}
					onDraftChange={setDraft}
					hexError={hexError}
					onHexErrorClear={() => setHexError(null)}
					t={t}
					nameInputId="ex-new-name"
					iconSelectId="ex-new-icon"
					trackWeightSwitchId="ex-new-track-weight"
				/>
				<div className="flex flex-wrap gap-2">
					<Button type="button" variant="outline" asChild>
						<Link to="/">{t("backHome")}</Link>
					</Button>
					<Button type="button" onClick={() => void handleSaveNew()}>
						{t("save")}
					</Button>
				</div>
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

	const exerciseId = validId;
	const accent = resolveExerciseTypeColor(et);

	async function handleConfirmDelete() {
		const ok = await deleteExerciseType(exerciseId);
		if (ok) {
			toast.success(t("toastExerciseDeleted"));
			setDeleteDialogOpen(false);
			navigate("/", { replace: true });
		} else {
			toast.error(t("toastExerciseDeleteFailed"));
		}
	}

	return (
		<div className="animate-in fade-in flex flex-col gap-6 py-4 duration-300">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex min-w-0 items-center gap-3">
					<ExerciseTypeIcon
						exerciseType={pickExerciseTypeIconVisual(et)}
						className="size-9 shrink-0"
						style={{ color: accent }}
						aria-hidden
					/>
					<div className="min-w-0">
						<h1 className="text-xl font-semibold">{et.name}</h1>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button type="button" size="sm" asChild>
						<Link to={`/stats/exercise/${et.id}`}>{t("detailedStats")}</Link>
					</Button>
					<Button type="button" variant="outline" size="sm" asChild>
						<Link to={`/exercises/${et.id}/edit`}>{t("editExercise")}</Link>
					</Button>
				</div>
			</div>

			{statsAll ? (
				<ExerciseDetailStatsSection
					t={t}
					language={i18n.language}
					trackWeightInSets={et.trackWeightInSets}
					todaySetCount={todaySetCount}
					todayReps={todayReps}
					todayTonnage={todayTonnage}
					totalRepsAllTime={statsAll.totalRepsAllTime}
					totalSetsAllTime={statsAll.totalSetsAllTime}
					activeDaysCount={statsAll.activeDaysCount}
					allTimeTonnage={allTimeTonnage}
				/>
			) : null}

			<div className="flex flex-wrap gap-2">
				{et.archivedAt ? (
					<Button type="button" variant="outline" onClick={() => void unarchiveExerciseType(et.id)}>
						{t("unarchive")}
					</Button>
				) : (
					<Button type="button" variant="outline" onClick={() => void archiveExerciseType(et.id)}>
						{t("archive")}
					</Button>
				)}
				<Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
					{t("deleteExerciseForever")}
				</Button>
			</div>

			<ExerciseDeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirmDelete={handleConfirmDelete}
				t={t}
			/>
		</div>
	);
}
