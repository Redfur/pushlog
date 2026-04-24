import NiceModal from "@ebay/nice-modal-react";
import { type ChangeEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePushlogStore } from "@/entities/pushup";
import { METRIKA_GOALS } from "@/shared/config/metrika-goals";
import { pushlogAnalytics } from "@/shared/lib/pushlog-analytics";
import {
	buildPushlogBackupFilename,
	createPushlogBackup,
	type PushlogBackupPayload,
	parsePushlogBackupAsync,
	restorePushlogFromBackup,
	serializePushlogBackup,
} from "@/shared/lib/storage";
import { SETTINGS_SCREEN_NS } from "../translations";
import { BackupImportDialog, type BackupImportSummary } from "./modals/BackupImportDialog";

function buildBackupImportSummary(payload: PushlogBackupPayload): BackupImportSummary {
	const exportedAt = new Intl.DateTimeFormat("ru-RU", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(payload.exportedAt));

	return {
		sets: payload.sets.length,
		exerciseTypes: payload.exerciseTypes.length,
		goals: Object.keys(payload.goalsByExerciseTypeId).length,
		exportedAt,
	};
}

export function BackupActionsCard() {
	const { t } = useTranslation(SETTINGS_SCREEN_NS);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [isExporting, setIsExporting] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [exportProgress, setExportProgress] = useState(0);
	const [importProgress, setImportProgress] = useState(0);
	const hydrate = usePushlogStore((s) => s.hydrate);

	const handleExport = async () => {
		if (isExporting || isImporting) return;
		setIsExporting(true);
		setExportProgress(5);
		try {
			const payload = await createPushlogBackup();
			setExportProgress(45);
			const content = serializePushlogBackup(payload);
			setExportProgress(80);
			const blob = new Blob([content], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = buildPushlogBackupFilename();
			a.click();
			URL.revokeObjectURL(url);
			setExportProgress(100);
			pushlogAnalytics.reachGoal(METRIKA_GOALS.settingsDataExportBackup, {
				sets_count: payload.sets.length,
				exercise_types_count: payload.exerciseTypes.length,
			});
			toast.success(t("backupExportSuccess"));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			toast.error(t("backupExportFailed", { message }));
		} finally {
			window.setTimeout(() => {
				setIsExporting(false);
				setExportProgress(0);
			}, 250);
		}
	};

	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		if (isImporting || isExporting) return;
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) {
			toast.error(t("backupImportNoFile"));
			return;
		}

		try {
			setImportProgress(10);
			const raw = await file.text();
			setImportProgress(35);
			const backup = await parsePushlogBackupAsync(raw);
			setImportProgress(50);
			void NiceModal.show(BackupImportDialog, {
				t,
				pendingSummary: buildBackupImportSummary(backup),
				onConfirmImport: () => handleConfirmImport(backup),
			});
		} catch (error) {
			setImportProgress(0);
			const message = error instanceof Error ? error.message : t("backupImportReadFailed");
			toast.error(t("backupImportFailed", { message }));
		}
	};

	const handleConfirmImport = async (backup: PushlogBackupPayload) => {
		if (isImporting) return false;
		setIsImporting(true);

		try {
			setImportProgress(55);
			await restorePushlogFromBackup(backup, (value) => {
				setImportProgress(Math.max(55, Math.round(55 + value * 0.4)));
			});
			setImportProgress(97);
			await hydrate();
			setImportProgress(100);
			pushlogAnalytics.reachGoal(METRIKA_GOALS.settingsDataImportBackup, {
				sets_count: backup.sets.length,
				exercise_types_count: backup.exerciseTypes.length,
			});
			toast.success(t("backupImportSuccess"));
			return true;
		} catch (error) {
			const message = error instanceof Error ? error.message : t("backupImportReadFailed");
			toast.error(t("backupImportFailed", { message }));
			return false;
		} finally {
			window.setTimeout(() => {
				setIsImporting(false);
				setImportProgress(0);
			}, 250);
		}
	};

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium">{t("backupSection")}</CardTitle>
				<CardDescription className="text-xs">{t("backupHint")}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 sm:flex-row">
				<Button
					type="button"
					variant="outline"
					onClick={() => void handleExport()}
					disabled={isExporting || isImporting}
				>
					{t("backupExport")}
				</Button>
				<Button type="button" variant="outline" onClick={handleImportClick} disabled={isExporting || isImporting}>
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
			{(isExporting || isImporting) && (
				<CardContent className="pt-0">
					<div className="space-y-2">
						{isExporting ? (
							<>
								<p className="text-muted-foreground text-xs">{t("backupExportProgressLabel")}</p>
								<Progress value={exportProgress} />
							</>
						) : null}
						{isImporting ? (
							<>
								<p className="text-muted-foreground text-xs">{t("backupImportProgressLabel")}</p>
								<Progress value={importProgress} />
							</>
						) : null}
					</div>
				</CardContent>
			)}
		</Card>
	);
}
