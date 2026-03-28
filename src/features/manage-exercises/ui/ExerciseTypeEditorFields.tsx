import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import {
	EXERCISE_COLOR_PRESET_HEX,
	EXERCISE_ICON_PRESET_KEYS,
	isValidCustomExerciseColor,
	isValidExerciseColorPreset,
	lucideIconVisual,
	resolveExerciseTypeColor,
} from "@/shared/config/exercise-type-presets";
import { cn } from "@/shared/lib/utils";
import { draftIconPreviewVisual, type ExerciseTypeDraft } from "./exercise-type-draft";

type Props = {
	draft: ExerciseTypeDraft;
	onDraftChange: (next: ExerciseTypeDraft | ((prev: ExerciseTypeDraft) => ExerciseTypeDraft)) => void;
	hexError: string | null;
	onHexErrorClear: () => void;
	t: (key: string) => string;
	nameInputId?: string;
	iconSelectId?: string;
};

export function ExerciseTypeEditorFields({
	draft,
	onDraftChange,
	hexError,
	onHexErrorClear,
	t,
	nameInputId = "ex-name",
	iconSelectId = "ex-icon",
}: Props) {
	const colorPickerValue =
		draft.colorKind === "custom" && isValidCustomExerciseColor(draft.colorValue) ? draft.colorValue : "#6366f1";

	const previewVisual = draftIconPreviewVisual(draft);
	const previewColor = resolveExerciseTypeColor({ colorKind: draft.colorKind, colorValue: draft.colorValue });

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor={nameInputId}>{t("nameLabel")}</Label>
				<Input
					id={nameInputId}
					value={draft.name}
					onChange={(e) => onDraftChange((d) => ({ ...d, name: e.target.value }))}
					maxLength={80}
					autoComplete="off"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<p className="text-sm font-medium">{t("iconDisplayLabel")}</p>
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						size="sm"
						variant={draft.iconDisplay === "lucide" ? "default" : "outline"}
						onClick={() => onDraftChange((d) => ({ ...d, iconDisplay: "lucide" }))}
					>
						{t("iconDisplayLucide")}
					</Button>
					<Button
						type="button"
						size="sm"
						variant={draft.iconDisplay === "text" ? "default" : "outline"}
						onClick={() => onDraftChange((d) => ({ ...d, iconDisplay: "text" }))}
					>
						{t("iconDisplayText")}
					</Button>
				</div>
			</div>

			{draft.iconDisplay === "lucide" ? (
				<div className="flex flex-col gap-1.5">
					<Label htmlFor={iconSelectId}>{t("iconLabel")}</Label>
					<Select value={draft.iconKey} onValueChange={(v) => onDraftChange((d) => ({ ...d, iconKey: v }))}>
						<SelectTrigger id={iconSelectId} className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{EXERCISE_ICON_PRESET_KEYS.map((key) => (
								<SelectItem key={key} value={key}>
									<span className="flex items-center gap-2">
										<ExerciseTypeIcon exerciseType={lucideIconVisual(key)} aria-hidden />
										<span className="capitalize">{key.replace(/-/g, " ")}</span>
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			) : (
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="ex-emoji">{t("emojiLabel")}</Label>
					<Input
						id="ex-emoji"
						value={draft.iconEmojiText}
						onChange={(e) => onDraftChange((d) => ({ ...d, iconEmojiText: e.target.value }))}
						maxLength={16}
						placeholder={t("emojiPlaceholder")}
						autoComplete="off"
					/>
					<p className="text-muted-foreground text-xs">{t("emojiHint")}</p>
				</div>
			)}

			<div className="flex items-center gap-3">
				<span className="text-muted-foreground text-sm">{t("iconPreview")}</span>
				<ExerciseTypeIcon exerciseType={previewVisual} className="size-9" style={{ color: previewColor }} aria-hidden />
			</div>

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
		</div>
	);
}
