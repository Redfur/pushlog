import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { MAIN_SCREEN_NS } from "../translations";

const MAX_INPUT_REPS = 9999;

type Props = {
	/** Можно отправлять подходы (день не в будущем и есть активные типы упражнений). */
	canAddSet: boolean;
	/** День в прошлом/сегодня по календарю; если false — показываем подсказку про будущее. */
	dayAllowsLogging: boolean;
	addReps: (reps: number) => void;
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

export function QuickAddPanel({ canAddSet, dayAllowsLogging, addReps }: Props) {
	const { t } = useTranslation(MAIN_SCREEN_NS);
	const [draft, setDraft] = useState("");

	const parsed = parseDraftInt(draft);
	const validForSubmit = parsed >= 1 && parsed <= MAX_INPUT_REPS;

	function submitReps(): boolean {
		if (!canAddSet || !validForSubmit) return false;
		void addReps(parsed);
		setDraft("");
		return true;
	}

	function onSubmit(e: FormEvent) {
		e.preventDefault();
		submitReps();
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
					value={draft}
					onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 4))}
				/>
				<Button type="submit" className="shrink-0 sm:min-w-[7.5rem]" disabled={!canAddSet || !validForSubmit}>
					{t("quickAddSubmit")}
				</Button>
			</form>
			<div className="flex flex-wrap gap-2">
				<Button
					type="button"
					variant="outline"
					size="default"
					disabled={!canAddSet || parsed <= 0}
					aria-label={t("quickAddMinusOneAria")}
					onClick={() => setDraft((d) => applyDelta(d, -1))}
				>
					-1
				</Button>
				<Button
					type="button"
					variant="outline"
					size="default"
					disabled={!canAddSet || parsed >= MAX_INPUT_REPS}
					aria-label={t("quickAddPlusOneAria")}
					onClick={() => setDraft((d) => applyDelta(d, 1))}
				>
					+1
				</Button>
				<Button
					type="button"
					variant="secondary"
					size="default"
					disabled={!canAddSet || parsed >= MAX_INPUT_REPS}
					aria-label={t("quickAddPlusFiveAria")}
					onClick={() => setDraft((d) => applyDelta(d, 5))}
				>
					+5
				</Button>
				<Button
					type="button"
					variant="secondary"
					size="default"
					disabled={!canAddSet || parsed >= MAX_INPUT_REPS}
					aria-label={t("quickAddPlusTenAria")}
					onClick={() => setDraft((d) => applyDelta(d, 10))}
				>
					+10
				</Button>
			</div>
			{!dayAllowsLogging ? <p className="text-muted-foreground text-xs">{t("futureDayReadOnly")}</p> : null}
		</div>
	);
}
