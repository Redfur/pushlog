import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { COMMON_NS } from "@/shared/i18n";

export function StatsRouteFallback() {
	const { t } = useTranslation(COMMON_NS);
	return (
		<div className="flex flex-col gap-4 py-4">
			<span className="sr-only">{t("loadingStats")}</span>
			<Skeleton className="h-8 w-48" />
			<div className="grid gap-3 sm:grid-cols-2">
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
			</div>
			<Skeleton className="h-32 w-full rounded-lg" />
		</div>
	);
}

export function SettingsRouteFallback() {
	const { t } = useTranslation(COMMON_NS);
	return (
		<div className="flex flex-col gap-4 py-4">
			<span className="sr-only">{t("loadingSettings")}</span>
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-24 w-full rounded-lg" />
			<Skeleton className="h-24 w-full rounded-lg" />
			<Skeleton className="h-40 w-full rounded-lg" />
		</div>
	);
}

export function ExerciseRouteFallback() {
	return (
		<div className="flex flex-col gap-4 py-4">
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-40 w-full rounded-lg" />
		</div>
	);
}
