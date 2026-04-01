import { Skeleton } from "@/components/ui/skeleton";

type Variant = "full" | "exercise";

type Props = {
	variant?: Variant;
};

export function StatsLoadingSkeleton({ variant = "full" }: Props) {
	if (variant === "exercise") {
		return (
			<div className="flex flex-col gap-4 py-4">
				<Skeleton className="h-8 w-56" />
				<div className="grid gap-3 sm:grid-cols-2">
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
				</div>
				<Skeleton className="h-56 w-full rounded-lg" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 py-4">
			<Skeleton className="h-8 w-48" />
			<div className="grid gap-3 sm:grid-cols-2">
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
			</div>
			<Skeleton className="h-24 w-full rounded-lg" />
			<Skeleton className="h-56 w-full rounded-lg" />
		</div>
	);
}
