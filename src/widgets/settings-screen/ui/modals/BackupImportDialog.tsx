import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useState } from "react";
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

type TFunction = (key: string, options?: Record<string, unknown>) => string;

export type BackupImportSummary = {
	sets: number;
	exerciseTypes: number;
	goals: number;
	exportedAt: string;
};

type BackupImportDialogProps = {
	t: TFunction;
	pendingSummary: BackupImportSummary;
	onConfirmImport: () => Promise<boolean>;
};

export const BackupImportDialog = NiceModal.create(
	({ t, pendingSummary, onConfirmImport }: BackupImportDialogProps) => {
		const modal = useModal();
		const [isSubmitting, setIsSubmitting] = useState(false);

		const closeModal = async () => {
			modal.resolve(true);
			await modal.hide();
			modal.remove();
		};

		const handleOpenChange = (open: boolean) => {
			if (open || isSubmitting) return;
			void closeModal();
		};

		const handleConfirm = async () => {
			if (isSubmitting) return;
			setIsSubmitting(true);
			const ok = await onConfirmImport();
			setIsSubmitting(false);
			if (!ok) return;
			await closeModal();
		};

		return (
			<AlertDialog open={modal.visible} onOpenChange={handleOpenChange}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("backupImportDialogTitle")}</AlertDialogTitle>
						<AlertDialogDescription>{t("backupImportDialogBody")}</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="text-muted-foreground space-y-1 text-sm">
						<p>{t("backupImportSummarySets", { count: pendingSummary.sets })}</p>
						<p>{t("backupImportSummaryExerciseTypes", { count: pendingSummary.exerciseTypes })}</p>
						<p>{t("backupImportSummaryGoals", { count: pendingSummary.goals })}</p>
						<p>{t("backupImportSummaryExportedAt", { value: pendingSummary.exportedAt })}</p>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isSubmitting}>{t("cancelDialog")}</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive/10 text-destructive hover:bg-destructive/20"
							onClick={(event) => {
								event.preventDefault();
								void handleConfirm();
							}}
							disabled={isSubmitting}
						>
							{t("backupImportConfirmAction")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	},
);
