import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { computeStatsForExerciseType, filterSetsByDayKey, usePushlogStore } from "@/entities/pushup";
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

export function ExercisePage() {
	const loc = useLocation();
	const { exerciseId: paramId } = useParams<{ exerciseId?: string }>();
	const rawParam = paramId ?? (loc.pathname === "/exercises/new" ? "new" : undefined);
	const navigate = useNavigate();
	const { t } = useTranslation(MANAGE_EXERCISES_NS);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const sets = usePushlogStore((s) => s.sets);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const addExerciseType = usePushlogStore((s) => s.addExerciseType);
	const archiveExerciseType = usePushlogStore((s) => s.archiveExerciseType);
	const unarchiveExerciseType = usePushlogStore((s) => s.unarchiveExerciseType);
	const timeZone = usePushlogStore((s) => s.timeZone);
	const todayKey = useTodayDayKey(timeZone);

	const isNew = rawParam === "new";
	const validId = rawParam && !isNew && isExerciseTypeUuid(rawParam) ? rawParam : null;
	const et = validId ? exerciseTypesById[validId] : undefined;

	const [draft, setDraft] = useState<ExerciseTypeDraft>(defaultExerciseTypeDraft);
	const [hexError, setHexError] = useState<string | null>(null);

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
		return (
			<div className="flex flex-col gap-4 py-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-40 w-full rounded-lg" />
			</div>
		);
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

	const accent = resolveExerciseTypeColor(et);

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
				<div className="flex flex-col gap-4">
					<div>
						<h2 className="text-muted-foreground mb-2 text-sm font-medium">{t("viewTodayTitle")}</h2>
						<div className="grid gap-3 sm:grid-cols-2">
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">{t("viewCardSets")}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-semibold tabular-nums">{todaySetCount}</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">{t("viewCardReps")}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-semibold tabular-nums">{todayReps}</p>
								</CardContent>
							</Card>
						</div>
					</div>
					<div>
						<h2 className="text-muted-foreground mb-2 text-sm font-medium">{t("viewAllTimeTitle")}</h2>
						<div className="grid gap-3 sm:grid-cols-2">
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">{t("viewCardReps")}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-semibold tabular-nums">{statsAll.totalRepsAllTime}</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">{t("viewCardSets")}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-semibold tabular-nums">{statsAll.totalSetsAllTime}</p>
								</CardContent>
							</Card>
							<Card className="sm:col-span-2">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">{t("viewCardActiveDays")}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-semibold tabular-nums">{statsAll.activeDaysCount}</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
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
			</div>
		</div>
	);
}
