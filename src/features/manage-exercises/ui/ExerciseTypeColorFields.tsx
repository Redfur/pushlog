import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	EXERCISE_COLOR_PRESET_HEX,
	isValidCustomExerciseColor,
	isValidExerciseColorPreset,
} from "@/shared/config/exercise-type-presets";
import { cn } from "@/shared/lib/utils";
import type { ExerciseTypeDraft } from "./exercise-type-draft";

type Props = {
	draft: ExerciseTypeDraft;
	onDraftChange: (next: ExerciseTypeDraft | ((prev: ExerciseTypeDraft) => ExerciseTypeDraft)) => void;
	hexError: string | null;
	onHexErrorClear: () => void;
	t: (key: string) => string;
};

export function ExerciseTypeColorFields({ draft, onDraftChange, hexError, onHexErrorClear, t }: Props) {
	const colorPickerValue =
		draft.colorKind === "custom" && isValidCustomExerciseColor(draft.colorValue) ? draft.colorValue : "#6366f1";

	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm font-medium">{t("colorSection")}</p>
			<div className="flex gap-2">
				<Button
					type="button"
					size="sm"
					variant={draft.colorKind === "preset" ? "default" : "outline"}
					onClick={() =>
						onDraftChange((d) => ({
							...d,
							colorKind: "preset",
							colorValue: isValidExerciseColorPreset(d.colorValue) ? d.colorValue : EXERCISE_COLOR_PRESET_HEX[0],
						}))
					}
				>
					{t("colorPresetTab")}
				</Button>
				<Button
					type="button"
					size="sm"
					variant={draft.colorKind === "custom" ? "default" : "outline"}
					onClick={() =>
						onDraftChange((d) => ({
							...d,
							colorKind: "custom",
							colorValue: isValidCustomExerciseColor(d.colorValue) ? d.colorValue : "#6366f1",
						}))
					}
				>
					{t("colorCustomTab")}
				</Button>
			</div>
			{draft.colorKind === "preset" ? (
				<div className="flex flex-wrap gap-2">
					{EXERCISE_COLOR_PRESET_HEX.map((hex) => (
						<button
							key={hex}
							type="button"
							className={cn(
								"size-9 rounded-md border-2 transition-opacity",
								draft.colorValue === hex ? "border-foreground ring-2 ring-ring/40" : "border-transparent",
							)}
							style={{ backgroundColor: hex }}
							aria-label={hex}
							onClick={() => onDraftChange((d) => ({ ...d, colorValue: hex }))}
						/>
					))}
				</div>
			) : (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-3">
						<Input
							type="color"
							className="h-10 w-14 cursor-pointer p-1"
							value={colorPickerValue}
							onChange={(e) => {
								onHexErrorClear();
								onDraftChange((d) => ({ ...d, colorValue: e.target.value }));
							}}
							aria-label={t("colorCustomTab")}
						/>
						<div className="min-w-0 flex-1">
							<Label htmlFor="ex-hex" className="text-muted-foreground text-xs">
								{t("hexLabel")}
							</Label>
							<Input
								id="ex-hex"
								value={draft.colorValue}
								onChange={(e) => {
									onHexErrorClear();
									onDraftChange((d) => ({ ...d, colorValue: e.target.value.trim() }));
								}}
								placeholder="#7c3aed"
								autoComplete="off"
								spellCheck={false}
								className="mt-1 font-mono text-sm"
							/>
						</div>
					</div>
					{hexError ? <p className="text-destructive text-xs">{hexError}</p> : null}
				</div>
			)}
		</div>
	);
}
