import { type FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PUSHLOG_CLIENT_STORAGE_CLEARED_EVENT } from "@/shared/lib/clear-client-storage";
import {
	isValidSetWeightKg,
	parseWeightDraft,
	roundWeightKg,
	SET_WEIGHT_MAX_KG,
} from "@/shared/lib/parse-weight-input";
import { loadQuickAddDraft, saveQuickAddDraft } from "@/shared/lib/quick-add-draft-storage";
import { cn } from "@/shared/lib/utils";
import { MAIN_SCREEN_NS } from "../translations";

const MAX_INPUT_REPS = 9999;
const DRAFT_SAVE_MS = 300;

type Props = {
	/** Можно отправлять подходы (день не в будущем и есть активные типы упражнений). */
	canAddSet: boolean;
	/** День в прошлом/сегодня по календарю; если false — показываем подсказку про будущее. */
	dayAllowsLogging: boolean;
	/** Выбранный тип упражнения требует вес (кг) вместе с повторениями. */
	trackWeight: boolean;
	/** Активный тип для черновика в localStorage. */
	exerciseTypeId: string;
	addReps: (
		reps: number,
		opts?: { weightKg?: number; exerciseTypeId?: string },
	) => void;
};

function parseDraftInt(draft: string): number {
	const n = Number.parseInt(draft.trim(), 10);
	return Number.isFinite(n) ? n : 0;
}

function clampReps(n: number): number {
	return Math.min(MAX_INPUT_REPS, Math.max(0, n));
}

function applyDelta(draft: string, delta: number): string {
	const next = clampReps(parseDraftInt(draft) + delta);
	if (next <= 0) return "";
	return String(next);
}

export function QuickAddPanel({ canAddSet, dayAllowsLogging, trackWeight, exerciseTypeId, addReps }: Props) {
	const { t } = useTranslation(MAIN_SCREEN_NS);
	const [draftReps, setDraftReps] = useState("");
	const [draftWeight, setDraftWeight] = useState("");
	const skipPersistUntilAfterHydrate = useRef(true);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!exerciseTypeId) {
			setDraftReps("");
			setDraftWeight("");
			return;
		}
		const d = loadQuickAddDraft(exerciseTypeId);
		setDraftReps(d?.reps ?? "");
		setDraftWeight(d?.weight ?? "");
		skipPersistUntilAfterHydrate.current = true;
	}, [exerciseTypeId]);

	useEffect(() => {
		if (!exerciseTypeId) return;
		if (skipPersistUntilAfterHydrate.current) {
			skipPersistUntilAfterHydrate.current = false;
			return;
		}
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = window.setTimeout(() => {
			saveQuickAddDraft(exerciseTypeId, { reps: draftReps, weight: draftWeight });
			debounceRef.current = null;
		}, DRAFT_SAVE_MS);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [exerciseTypeId, draftReps, draftWeight]);

	useEffect(() => {
		function onStorageCleared() {
			setDraftReps("");
			setDraftWeight("");
		}
		window.addEventListener(PUSHLOG_CLIENT_STORAGE_CLEARED_EVENT, onStorageCleared);
		return () => window.removeEventListener(PUSHLOG_CLIENT_STORAGE_CLEARED_EVENT, onStorageCleared);
	}, []);

	const parsedReps = parseDraftInt(draftReps);
	const validReps = parsedReps >= 1 && parsedReps <= MAX_INPUT_REPS;

	const parsedWeight = parseWeightDraft(draftWeight);
	const validWeight = !trackWeight || (parsedWeight != null && isValidSetWeightKg(roundWeightKg(parsedWeight)));

	const validForSubmit = validReps && validWeight;

	function submitReps(): boolean {
		if (!canAddSet || !validForSubmit) return false;
		if (trackWeight && parsedWeight != null) {
			const w = roundWeightKg(parsedWeight);
			if (!isValidSetWeightKg(w)) return false;
			void addReps(parsedReps, { weightKg: w, exerciseTypeId });
		} else {
			void addReps(parsedReps, { exerciseTypeId });
		}
		if (exerciseTypeId) {
			saveQuickAddDraft(exerciseTypeId, { reps: draftReps, weight: draftWeight });
		}
		return true;
	}

	function onSubmit(e: FormEvent) {
		e.preventDefault();
		submitReps();
	}

	function onWeightChange(raw: string) {
		let next = raw.replace(",", ".").replace(/[^\d.]/g, "");
		const dot = next.indexOf(".");
		if (dot !== -1) {
			next = `${next.slice(0, dot + 1)}${next
				.slice(dot + 1)
				.replace(/\./g, "")
				.slice(0, 2)}`;
		}
		if (next.length > 8) return;
		if (next !== "" && next !== ".") {
			const n = Number.parseFloat(next);
			if (Number.isFinite(n) && n > SET_WEIGHT_MAX_KG) return;
		}
		setDraftWeight(next);
	}

	return (
		<div className="flex flex-col gap-3">
			<form className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2" onSubmit={onSubmit}>
				<Input
					aria-label={t("quickAddRepsInputAria")}
					className={cn(
						"min-w-0 flex-1 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
					)}
					disabled={!canAddSet}
					inputMode="numeric"
					pattern="[0-9]*"
					placeholder={t("quickAddRepsPlaceholder")}
					type="text"
					value={draftReps}
					onChange={(e) => setDraftReps(e.target.value.replace(/\D/g, "").slice(0, 4))}
				/>
				{trackWeight ? (
					<Input
						aria-label={t("quickAddWeightInputAria")}
						className="min-w-0 flex-1 tabular-nums sm:max-w-[8rem]"
						disabled={!canAddSet}
						inputMode="decimal"
						placeholder={t("quickAddWeightPlaceholder")}
						type="text"
						value={draftWeight}
						onChange={(e) => onWeightChange(e.target.value)}
					/>
				) : null}
				<Button type="submit" className="shrink-0 sm:min-w-[7.5rem]" disabled={!canAddSet || !validForSubmit}>
					{t("quickAddSubmit")}
				</Button>
			</form>
			<div className="flex flex-wrap gap-2">
				<Button
					type="button"
					variant="outline"
					size="default"
					disabled={!canAddSet || parsedReps <= 0}
					aria-label={t("quickAddMinusOneAria")}
					onClick={() => setDraftReps((d) => applyDelta(d, -1))}
				>
					-1
				</Button>
				<Button
					type="button"
					variant="outline"
					size="default"
					disabled={!canAddSet || parsedReps >= MAX_INPUT_REPS}
					aria-label={t("quickAddPlusOneAria")}
					onClick={() => setDraftReps((d) => applyDelta(d, 1))}
				>
					+1
				</Button>
				<Button
					type="button"
					variant="secondary"
					size="default"
					disabled={!canAddSet || parsedReps >= MAX_INPUT_REPS}
					aria-label={t("quickAddPlusFiveAria")}
					onClick={() => setDraftReps((d) => applyDelta(d, 5))}
				>
					+5
				</Button>
				<Button
					type="button"
					variant="secondary"
					size="default"
					disabled={!canAddSet || parsedReps >= MAX_INPUT_REPS}
					aria-label={t("quickAddPlusTenAria")}
					onClick={() => setDraftReps((d) => applyDelta(d, 10))}
				>
					+10
				</Button>
			</div>
			{!dayAllowsLogging ? <p className="text-muted-foreground text-xs">{t("futureDayReadOnly")}</p> : null}
		</div>
	);
}
