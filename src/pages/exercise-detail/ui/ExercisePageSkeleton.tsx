import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, ScreenBody } from "@/shared/layout";

export function ExercisePageSkeleton() {
	return (
		<ScreenBody variant="skeletonSticky">
			<PageHeaderSkeleton />
			<Skeleton className="h-40 w-full rounded-lg" />
		</ScreenBody>
	);
}
