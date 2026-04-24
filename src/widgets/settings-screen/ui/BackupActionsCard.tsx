import { type ChangeEvent, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushlogStore } from "@/entities/pushup";
import { METRIKA_GOALS } from "@/shared/config/metrika-goals";
import { pushlogAnalytics } from "@/shared/lib/pushlog-analytics";
import {
	buildPushlogBackupFilename,
	createPushlogBackup,
	type PushlogBackupPayload,
	parsePushlogBackup,
	restorePushlogFromBackup,
	serializePushlogBackup,
} from "@/shared/lib/storage";
import { SETTINGS_SCREEN_NS } from "../translations";

export function BackupActionsCard() {
	const { t } = useTranslation(SETTINGS_SCREEN_NS);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [importDialogOpen, setImportDialogOpen] = useState(false);
	const [pendingImport, setPendingImport] = useState<PushlogBackupPayload | null>(null);
	const [isImporting, setIsImporting] = useState(false);
	const hydrate = usePushlogStore((s) => s.hydrate);

	const pendingSummary = useMemo(() => {
		if (!pendingImport) return null;
		const exportedAt = new Intl.DateTimeFormat("ru-RU", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(pendingImport.exportedAt));
		return {
			sets: pendingImport.sets.length,
			exerciseTypes: pendingImport.exerciseTypes.length,
			goals: Object.keys(pendingImport.goalsByExerciseTypeId).length,
			exportedAt,
		};
	}, [pendingImport]);

	const handleExport = async () => {
		try {
			const payload = await createPushlogBackup();
			const content = serializePushlogBackup(payload);
			const blob = new Blob([content], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = buildPushlogBackupFilename();
			a.click();
			URL.revokeObjectURL(url);
			pushlogAnalytics.reachGoal(METRIKA_GOALS.settingsDataExportBackup, {
				sets_count: payload.sets.length,
				exercise_types_count: payload.exerciseTypes.length,
			});
			toast.success(t("backupExportSuccess"));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			toast.error(t("backupExportFailed", { message }));
		}
	};

	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) {
			toast.error(t("backupImportNoFile"));
			return;
		}

		try {
			const raw = await file.text();
			const backup = parsePushlogBackup(raw);
			setPendingImport(backup);
			setImportDialogOpen(true);
		} catch (error) {
			const message = error instanceof Error ? error.message : t("backupImportReadFailed");
			toast.error(t("backupImportFailed", { message }));
		}
	};

	const handleConfirmImport = async () => {
		if (!pendingImport || isImporting) return;
		setIsImporting(true);

		try {
			const backup = pendingImport;
			await restorePushlogFromBackup(backup);
			await hydrate();
			pushlogAnalytics.reachGoal(METRIKA_GOALS.settingsDataImportBackup, {
				sets_count: backup.sets.length,
				exercise_types_count: backup.exerciseTypes.length,
			});
			setPendingImport(null);
			setImportDialogOpen(false);
			toast.success(t("backupImportSuccess"));
		} catch (error) {
			const message = error instanceof Error ? error.message : t("backupImportReadFailed");
			toast.error(t("backupImportFailed", { message }));
		} finally {
			setIsImporting(false);
		}
	};

	return (
		<>
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">{t("backupSection")}</CardTitle>
					<CardDescription className="text-xs">{t("backupHint")}</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-2 sm:flex-row">
					<Button type="button" variant="outline" onClick={() => void handleExport()}>
						{t("backupExport")}
					</Button>
					<Button type="button" variant="outline" onClick={handleImportClick}>
						{t("backupImport")}
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept="application/json,.json"
						className="sr-only"
						onChange={(event) => void handleImportFileChange(event)}
					/>
				</CardContent>
			</Card>

			<AlertDialog
				open={importDialogOpen}
				onOpenChange={(open) => {
					setImportDialogOpen(open);
					if (!open) setPendingImport(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("backupImportDialogTitle")}</AlertDialogTitle>
						<AlertDialogDescription>{t("backupImportDialogBody")}</AlertDialogDescription>
					</AlertDialogHeader>
					{pendingSummary ? (
						<div className="text-muted-foreground space-y-1 text-sm">
							<p>{t("backupImportSummarySets", { count: pendingSummary.sets })}</p>
							<p>{t("backupImportSummaryExerciseTypes", { count: pendingSummary.exerciseTypes })}</p>
							<p>{t("backupImportSummaryGoals", { count: pendingSummary.goals })}</p>
							<p>{t("backupImportSummaryExportedAt", { value: pendingSummary.exportedAt })}</p>
						</div>
					) : null}
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isImporting}>{t("cancelDialog")}</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive/10 text-destructive hover:bg-destructive/20"
							onClick={(event) => {
								event.preventDefault();
								void handleConfirmImport();
							}}
							disabled={isImporting || !pendingImport}
						>
							{t("backupImportConfirmAction")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
