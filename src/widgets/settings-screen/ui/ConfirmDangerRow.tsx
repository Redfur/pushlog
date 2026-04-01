import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

type Props = {
	triggerLabel: string;
	title: string;
	body: string;
	description: string;
	confirmLabel: string;
	cancelLabel: string;
	onConfirm: () => void | Promise<void>;
};

export function ConfirmDangerRow({
	triggerLabel,
	title,
	body,
	description,
	confirmLabel,
	cancelLabel,
	onConfirm,
}: Props) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium">{triggerLabel}</p>
				<p className="text-muted-foreground mt-0.5 text-xs leading-snug">{description}</p>
			</div>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button type="button" variant="destructive" className="shrink-0">
						{triggerLabel}
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{title}</AlertDialogTitle>
						<AlertDialogDescription>{body}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
						<AlertDialogAction
							className={cn(buttonVariants({ variant: "destructive" }))}
							onClick={() => void onConfirm()}
						>
							{confirmLabel}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
