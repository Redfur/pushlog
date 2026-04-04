import { MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ExerciseDailyGoalEditor, parseDailyGoalInput, SET_DAILY_GOAL_NS } from "@/features/set-daily-goal";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import {
	isExerciseTypeUuid,
	pickExerciseTypeIconVisual,
	resolveExerciseTypeColor,
} from "@/shared/config/exercise-type-presets";
import { PageHeader, PageHeaderBackLink, ScreenBody } from "@/shared/layout";
import { ExerciseDeleteDialog } from "./ExerciseDeleteDialog";
import { ExerciseDetailStatsSection } from "./ExerciseDetailStatsSection";
import { ExercisePageSkeleton } from "./ExercisePageSkeleton";

export function ExercisePage() {
	const loc = useLocation();
	const { exerciseId: paramId } = useParams<{ exerciseId?: string }>();
	const rawParam = paramId ?? (loc.pathname === "/exercises/new" ? "new" : undefined);
	const navigate = useNavigate();
	const { t, i18n } = useTranslation(MANAGE_EXERCISES_NS);
	const { t: tGoal } = useTranslation(SET_DAILY_GOAL_NS);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const sets = usePushlogStore((s) => s.sets);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const addExerciseType = usePushlogStore((s) => s.addExerciseType);
	const setDailyGoal = usePushlogStore((s) => s.setDailyGoal);
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
		const id = await addExerciseType(normalized.value);
		if (!id) return;

		if (parsedGoal.kind === "valid") {
			await setDailyGoal(parsedGoal.reps, id);
			if (usePushlogStore.getState().lastError) {
				toast.error(tGoal("toastGoalPersistFailed"));
			}
		}

		navigate(`/exercises/${id}`, { replace: true });
	}

	if (!hydrated) {
		return <ExercisePageSkeleton />;
	}

	if (isNew) {
		return (
			<ScreenBody gap="comfortable">
				<PageHeader leading={<PageHeaderBackLink to="/" ariaLabel={t("backHome")} />} title={t("newPageTitle")} />
				<form
					className="flex flex-col gap-6"
					onSubmit={(e) => {
						e.preventDefault();
						void handleSaveNew();
					}}
				>
					<div className="flex flex-col gap-4">
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
						<ExerciseDailyGoalEditor
							value={draft.dailyGoalInput}
							onChange={(v) => setDraft((d) => ({ ...d, dailyGoalInput: v }))}
							inputId="ex-new-daily-goal"
							descriptionHint="optionalHint"
						/>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
						<Button type="submit">{t("save")}</Button>
					</div>
				</form>
			</ScreenBody>
		);
	}

	if (!validId || !et) {
		return (
			<ScreenBody gap="compact">
				<PageHeader leading={<PageHeaderBackLink to="/" ariaLabel={t("backHome")} />} title={t("exerciseNotFound")} />
			</ScreenBody>
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
		<ScreenBody gap="comfortable">
			<PageHeader
				leading={<PageHeaderBackLink to="/" ariaLabel={t("backHome")} />}
				media={
					<ExerciseTypeIcon
						exerciseType={pickExerciseTypeIconVisual(et)}
						className="size-9 shrink-0"
						style={{ color: accent }}
						aria-hidden
					/>
				}
				title={et.name}
				actions={
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button type="button" variant="outline" size="icon" aria-label={t("headerMoreActionsAria")}>
								<MoreHorizontal className="size-5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="min-w-48">
							<DropdownMenuItem asChild>
								<Link to={`/stats/exercise/${et.id}`}>{t("detailedStats")}</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to={`/exercises/${et.id}/edit`}>{t("editExercise")}</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				}
			/>

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
		</ScreenBody>
	);
}
