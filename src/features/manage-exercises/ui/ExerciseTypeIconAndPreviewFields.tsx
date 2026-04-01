import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import {
	EXERCISE_ICON_PRESET_KEYS,
	lucideIconVisual,
	resolveExerciseTypeColor,
} from "@/shared/config/exercise-type-presets";
import { draftIconPreviewVisual, type ExerciseTypeDraft } from "./exercise-type-draft";

type Props = {
	draft: ExerciseTypeDraft;
	onDraftChange: (next: ExerciseTypeDraft | ((prev: ExerciseTypeDraft) => ExerciseTypeDraft)) => void;
	t: (key: string) => string;
	nameInputId: string;
	iconSelectId: string;
	trackWeightSwitchId: string;
};

export function ExerciseTypeIconAndPreviewFields({
	draft,
	onDraftChange,
	t,
	nameInputId,
	iconSelectId,
	trackWeightSwitchId,
}: Props) {
	const previewVisual = draftIconPreviewVisual(draft);
	const previewColor = resolveExerciseTypeColor({ colorKind: draft.colorKind, colorValue: draft.colorValue });

	return (
		<>
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

			<div className="flex flex-col gap-2 rounded-lg border border-border/60 p-3">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 space-y-1">
						<Label htmlFor={trackWeightSwitchId} className="text-sm font-medium">
							{t("trackWeightLabel")}
						</Label>
						<p className="text-muted-foreground text-xs">{t("trackWeightHint")}</p>
					</div>
					<Switch
						id={trackWeightSwitchId}
						checked={draft.trackWeightInSets}
						onCheckedChange={(v) => onDraftChange((d) => ({ ...d, trackWeightInSets: v }))}
					/>
				</div>
			</div>
		</>
	);
}
