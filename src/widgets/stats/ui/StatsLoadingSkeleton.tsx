import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, ScreenBody } from "@/shared/layout";

type Variant = "full" | "exercise";

type Props = {
	variant?: Variant;
};

export function StatsLoadingSkeleton({ variant = "full" }: Props) {
	if (variant === "exercise") {
		return (
			<ScreenBody variant="skeletonSticky">
				<PageHeaderSkeleton />
				<div className="grid gap-3 sm:grid-cols-2">
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
				</div>
				<Skeleton className="h-56 w-full rounded-lg" />
			</ScreenBody>
		);
	}

	return (
		<ScreenBody variant="skeleton">
			<Skeleton className="h-8 w-48" />
			<div className="grid gap-3 sm:grid-cols-2">
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
			</div>
			<Skeleton className="h-24 w-full rounded-lg" />
			<Skeleton className="h-56 w-full rounded-lg" />
		</ScreenBody>
	);
}
