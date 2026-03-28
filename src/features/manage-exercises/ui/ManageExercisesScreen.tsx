import { BarChart2, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePushlogStore } from "@/entities/pushup";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import {
	EXERCISE_COLOR_PRESET_KEYS,
	EXERCISE_ICON_PRESET_KEYS,
	isValidCustomExerciseColor,
	isValidExerciseColorPreset,
	isValidExerciseIconKey,
	resolveExerciseTypeColor,
} from "@/shared/config/exercise-type-presets";
import type { PersistedExerciseType } from "@/shared/lib/storage/schema";
import { cn } from "@/shared/lib/utils";
import { MANAGE_EXERCISES_NS } from "../translations";

type Draft = {
	name: string;
	iconKey: string;
	colorKind: "preset" | "custom";
	colorValue: string;
};

function draftFromType(et: PersistedExerciseType): Draft {
	return {
		name: et.name,
		iconKey: et.iconKey,
		colorKind: et.colorKind,
		colorValue: et.colorValue,
	};
}

function defaultDraft(): Draft {
	return {
		name: "",
		iconKey: "dumbbell",
		colorKind: "preset",
		colorValue: "chart-1",
	};
}

export function ManageExercisesScreen() {
	const { t } = useTranslation(MANAGE_EXERCISES_NS);
	const hydrated = usePushlogStore((s) => s.hydrated);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const addExerciseType = usePushlogStore((s) => s.addExerciseType);
	const updateExerciseType = usePushlogStore((s) => s.updateExerciseType);
	const archiveExerciseType = usePushlogStore((s) => s.archiveExerciseType);
	const unarchiveExerciseType = usePushlogStore((s) => s.unarchiveExerciseType);

	const [sheetOpen, setSheetOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draft, setDraft] = useState<Draft>(defaultDraft);
	const [hexError, setHexError] = useState<string | null>(null);

	const { active, archived } = useMemo(() => {
		const all = Object.values(exerciseTypesById);
		const a = all.filter((x) => !x.archivedAt).sort((x, y) => x.name.localeCompare(y.name, "ru"));
		const ar = all.filter((x) => x.archivedAt).sort((x, y) => x.name.localeCompare(y.name, "ru"));
		return { active: a, archived: ar };
	}, [exerciseTypesById]);

	function openCreate() {
		setEditingId(null);
		setDraft(defaultDraft());
		setHexError(null);
		setSheetOpen(true);
	}

	function openEdit(id: string) {
		const et = exerciseTypesById[id];
		if (!et) return;
		setEditingId(id);
		setDraft(draftFromType(et));
		setHexError(null);
		setSheetOpen(true);
	}

	async function handleSave() {
		const name = draft.name.trim();
		if (!name) return;
		const iconKey = isValidExerciseIconKey(draft.iconKey) ? draft.iconKey : "activity";
		const colorKind = draft.colorKind;
		let colorValue = draft.colorValue.trim();
		if (colorKind === "custom") {
			if (!colorValue.startsWith("#")) colorValue = `#${colorValue}`;
			if (!isValidCustomExerciseColor(colorValue)) {
				setHexError(t("hexInvalid"));
				return;
			}
			setHexError(null);
		} else if (!isValidExerciseColorPreset(colorValue)) {
			colorValue = "chart-1";
		}

		if (editingId) {
			await updateExerciseType(editingId, { name, iconKey, colorKind, colorValue });
		} else {
			await addExerciseType({ name, iconKey, colorKind, colorValue });
		}
		setSheetOpen(false);
	}

	const colorPickerValue =
		draft.colorKind === "custom" && isValidCustomExerciseColor(draft.colorValue) ? draft.colorValue : "#6366f1";

	if (!hydrated) {
		return null;
	}

	return (
		<div className="animate-in fade-in flex flex-col gap-4 py-4 duration-300">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold">{t("title")}</h1>
					<p className="text-muted-foreground mt-1 max-w-prose text-sm">{t("hint")}</p>
				</div>
				<Button type="button" onClick={openCreate}>
					{t("addExercise")}
				</Button>
			</div>

			<div>
				<h2 className="text-muted-foreground mb-2 text-sm font-medium">{t("activeSection")}</h2>
				{active.length === 0 ? (
					<p className="text-muted-foreground text-sm">{t("emptyActive")}</p>
				) : (
					<ul className="flex flex-col gap-2">
						{active.map((et) => (
							<ExerciseTypeRow
								key={et.id}
								et={et}
								onEdit={() => openEdit(et.id)}
								onArchive={() => void archiveExerciseType(et.id)}
								archiveLabel={t("archive")}
								editLabel={t("edit")}
								statsLabel={t("statsLink")}
							/>
						))}
					</ul>
				)}
			</div>

			<div>
				<h2 className="text-muted-foreground mb-2 text-sm font-medium">{t("archivedSection")}</h2>
				{archived.length === 0 ? (
					<p className="text-muted-foreground text-sm">{t("emptyArchived")}</p>
				) : (
					<ul className="flex flex-col gap-2">
						{archived.map((et) => (
							<ExerciseTypeRow
								key={et.id}
								et={et}
								onEdit={() => openEdit(et.id)}
								onArchive={() => void unarchiveExerciseType(et.id)}
								archiveLabel={t("unarchive")}
								editLabel={t("edit")}
								statsLabel={t("statsLink")}
							/>
						))}
					</ul>
				)}
			</div>

			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
					<SheetHeader>
						<SheetTitle>{editingId ? t("sheetEditTitle") : t("sheetCreateTitle")}</SheetTitle>
					</SheetHeader>
					<div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="ex-name">{t("nameLabel")}</Label>
							<Input
								id="ex-name"
								value={draft.name}
								onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
								maxLength={80}
								autoComplete="off"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="ex-icon">{t("iconLabel")}</Label>
							<Select value={draft.iconKey} onValueChange={(v) => setDraft((d) => ({ ...d, iconKey: v }))}>
								<SelectTrigger id="ex-icon" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{EXERCISE_ICON_PRESET_KEYS.map((key) => (
										<SelectItem key={key} value={key}>
											<span className="flex items-center gap-2">
												<ExerciseTypeIcon iconKey={key} aria-hidden />
												<span>{key}</span>
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-2">
							<p className="text-sm font-medium">{t("colorSection")}</p>
							<div className="flex gap-2">
								<Button
									type="button"
									size="sm"
									variant={draft.colorKind === "preset" ? "default" : "outline"}
									onClick={() =>
										setDraft((d) => ({
											...d,
											colorKind: "preset",
											colorValue: isValidExerciseColorPreset(d.colorValue) ? d.colorValue : "chart-1",
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
										setDraft((d) => ({
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
									{EXERCISE_COLOR_PRESET_KEYS.map((ck) => (
										<button
											key={ck}
											type="button"
											className={cn(
												"size-9 rounded-md border-2 transition-opacity",
												draft.colorValue === ck ? "border-foreground ring-2 ring-ring/40" : "border-transparent",
											)}
											style={{ backgroundColor: `var(--color-${ck})` }}
											aria-label={ck}
											onClick={() => setDraft((d) => ({ ...d, colorValue: ck }))}
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
												setHexError(null);
												setDraft((d) => ({ ...d, colorValue: e.target.value }));
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
													setHexError(null);
													setDraft((d) => ({ ...d, colorValue: e.target.value.trim() }));
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
					<SheetFooter className="flex-row gap-2 border-t pt-4">
						<Button type="button" variant="outline" className="flex-1" onClick={() => setSheetOpen(false)}>
							{t("cancel")}
						</Button>
						<Button type="button" className="flex-1" onClick={() => void handleSave()}>
							{t("save")}
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
}

type RowProps = {
	et: PersistedExerciseType;
	onEdit: () => void;
	onArchive: () => void;
	editLabel: string;
	archiveLabel: string;
	statsLabel: string;
};

function ExerciseTypeRow({ et, onEdit, onArchive, editLabel, archiveLabel, statsLabel }: RowProps) {
	const accent = resolveExerciseTypeColor(et);
	return (
		<li>
			<Card>
				<CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
					<span
						className="size-3 shrink-0 rounded-full border border-border/60"
						style={{ backgroundColor: accent }}
						aria-hidden
					/>
					<ExerciseTypeIcon iconKey={et.iconKey} className="size-5" style={{ color: accent }} aria-hidden />
					<div className="min-w-0 flex-1">
						<CardTitle className="truncate text-base">{et.name}</CardTitle>
					</div>
					<div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
						<Button type="button" variant="ghost" size="icon-sm" asChild>
							<Link to={`/stats/exercise/${et.id}`} aria-label={statsLabel}>
								<BarChart2 className="size-4" />
							</Link>
						</Button>
						<Button type="button" variant="ghost" size="icon-sm" onClick={onEdit} aria-label={editLabel}>
							<Pencil className="size-4" />
						</Button>
						<Button type="button" variant="outline" size="sm" onClick={onArchive}>
							{archiveLabel}
						</Button>
					</div>
				</CardHeader>
			</Card>
		</li>
	);
}
