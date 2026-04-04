import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type Props = {
	/** Плейсхолдер иконки упражнения между «назад» и заголовком */
	showMedia?: boolean;
	className?: string;
};

export function PageHeaderSkeleton({ showMedia = true, className }: Props) {
	return (
		<div className={cn("flex flex-wrap items-start gap-2 sm:gap-3", className)}>
			<Skeleton className="size-8 shrink-0 rounded-lg" />
			{showMedia ? (
				<div className="flex min-w-0 flex-1 items-start gap-3">
					<Skeleton className="size-9 shrink-0 rounded-lg" />
					<Skeleton className="h-7 w-48 max-w-full min-w-0 flex-1 sm:w-56" />
				</div>
			) : (
				<Skeleton className="h-7 max-w-full min-w-0 flex-1 sm:max-w-md" />
			)}
		</div>
	);
}
