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
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirmDelete: () => void | Promise<void>;
	t: TFunction;
};

export function ExerciseDeleteDialog({ open, onOpenChange, onConfirmDelete, t }: Props) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t("deleteExerciseDialogTitle")}</AlertDialogTitle>
					<AlertDialogDescription>{t("deleteExerciseDialogDescription")}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel type="button">{t("cancel")}</AlertDialogCancel>
					<Button type="button" variant="destructive" onClick={() => void onConfirmDelete()}>
						{t("deleteExerciseConfirm")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
