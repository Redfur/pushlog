import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type TFunction = (key: string) => string;

type Props = {
	onConfirmDelete: () => boolean | Promise<boolean>;
	t: TFunction;
};

export const ExerciseDeleteDialog = NiceModal.create(({ onConfirmDelete, t }: Props) => {
	const modal = useModal();

	const handleOpenChange = (open: boolean) => {
		if (open) return;
		modal.resolve(false);
		void modal.hide().then(() => {
			modal.remove();
		});
	};

	const handleConfirmDelete = async () => {
		const ok = await onConfirmDelete();
		if (!ok) return;
		modal.resolve(true);
		await modal.hide();
		modal.remove();
	};

	return (
		<AlertDialog open={modal.visible} onOpenChange={handleOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("deleteExerciseDialogTitle")}</AlertDialogTitle>
					<AlertDialogDescription>{t("deleteExerciseDialogDescription")}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel type="button">{t("cancel")}</AlertDialogCancel>
					<Button type="button" variant="destructive" onClick={() => void handleConfirmDelete()}>
						{t("deleteExerciseConfirm")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
});
