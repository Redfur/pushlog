import { X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADD_SET_NS } from "@/features/add-set";
import { QUICK_ADD_PRESETS } from "@/shared/config/pushlog";
import { cn } from "@/shared/lib/utils";
import { useCustomQuickAddPresets } from "../model/use-custom-quick-add-presets";
import { MAIN_SCREEN_NS } from "../translations";

const MAX_INPUT_REPS = 9999;

type Props = {
	/** Можно отправлять подходы (день не в будущем и есть активные типы упражнений). */
	canAddSet: boolean;
	/** День в прошлом/сегодня по календарю; если false — показываем подсказку про будущее. */
	dayAllowsLogging: boolean;
	addReps: (reps: number) => void;
	repeatLast: () => void;
	/** Если задано — заголовок с именем выбранного упражнения. */
	selectedExerciseName?: string;
};

export function QuickAddPanel({ canAddSet, dayAllowsLogging, addReps, repeatLast, selectedExerciseName }: Props) {
	const { t } = useTranslation(MAIN_SCREEN_NS);
	const { t: tAdd } = useTranslation(ADD_SET_NS);
	const { customPresets, rememberPreset, removePreset } = useCustomQuickAddPresets();
	const [draft, setDraft] = useState("");

	function parseAndApply(value: string): boolean {
		const n = Number.parseInt(value.trim(), 10);
		if (!Number.isFinite(n) || n < 1 || n > MAX_INPUT_REPS) return false;
		void addReps(n);
		rememberPreset(n);
		return true;
	}

	function onSubmitCustom(e: FormEvent) {
		e.preventDefault();
		if (!canAddSet) return;
		if (parseAndApply(draft)) {
			setDraft("");
		}
	}

	return (
		<div className="flex flex-col gap-3">
			<p className="text-muted-foreground text-sm">
				{selectedExerciseName ? t("quickAddForExercise", { name: selectedExerciseName }) : t("quickAdd")}
			</p>
			<div className="flex flex-wrap items-center gap-2">
				{QUICK_ADD_PRESETS.map((n) => (
					<Button
						key={`default-${n}`}
						type="button"
						size="lg"
						variant="default"
						disabled={!canAddSet}
						onClick={() => void addReps(n)}
					>
						+{n}
					</Button>
				))}
				{customPresets.map((n) => (
					<div key={`custom-${n}`} className="relative inline-flex">
						<Button type="button" size="lg" variant="default" disabled={!canAddSet} onClick={() => void addReps(n)}>
							+{n}
						</Button>
						<button
							type="button"
							className="bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full border text-xs shadow-sm"
							aria-label={t("removePresetAria", { count: n })}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								removePreset(n);
							}}
						>
							<X className="size-3.5" />
						</button>
					</div>
				))}
				<form className="inline-flex" onSubmit={onSubmitCustom}>
					<Input
						aria-label={t("quickAddInputAria")}
						className={cn(
							buttonVariants({ variant: "outline", size: "lg" }),
							"min-w-[5.5rem] max-w-[6.5rem] tabular-nums [appearance:textfield] placeholder:text-muted-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
						)}
						disabled={!canAddSet}
						inputMode="numeric"
						pattern="[0-9]*"
						placeholder={tAdd("customPlaceholder")}
						type="text"
						value={draft}
						onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 4))}
					/>
				</form>
				<Button type="button" size="lg" variant="secondary" disabled={!canAddSet} onClick={() => repeatLast()}>
					{tAdd("repeatLast")}
				</Button>
			</div>
			{!dayAllowsLogging ? <p className="text-muted-foreground text-xs">{t("futureDayReadOnly")}</p> : null}
		</div>
	);
}
