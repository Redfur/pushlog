import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { COMMON_NS } from "@/shared/i18n";
import { PageHeaderSkeleton, ScreenBody } from "@/shared/layout";

export function StatsRouteFallback() {
	const { t } = useTranslation(COMMON_NS);
	return (
		<ScreenBody variant="skeleton">
			<span className="sr-only">{t("loadingStats")}</span>
			<Skeleton className="h-8 w-48" />
			<div className="grid gap-3 sm:grid-cols-2">
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
			</div>
			<Skeleton className="h-32 w-full rounded-lg" />
		</ScreenBody>
	);
}

export function SettingsRouteFallback() {
	const { t } = useTranslation(COMMON_NS);
	return (
		<ScreenBody variant="skeleton">
			<span className="sr-only">{t("loadingSettings")}</span>
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-24 w-full rounded-lg" />
			<Skeleton className="h-24 w-full rounded-lg" />
			<Skeleton className="h-40 w-full rounded-lg" />
		</ScreenBody>
	);
}

export function ExerciseRouteFallback() {
	return (
		<ScreenBody variant="skeletonSticky">
			<PageHeaderSkeleton showMedia={false} />
			<Skeleton className="h-40 w-full rounded-lg" />
		</ScreenBody>
	);
}
