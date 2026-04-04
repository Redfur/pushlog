import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/widgets/page-header";

export function ExercisePageSkeleton() {
	return (
		<div className="flex flex-col gap-4 py-4">
			<PageHeaderSkeleton />
			<Skeleton className="h-40 w-full rounded-lg" />
		</div>
	);
}
