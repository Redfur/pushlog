import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/app/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { DayPage } from "@/pages/day";
import { HomePage } from "@/pages/home";
import { COMMON_NS } from "@/shared/i18n";

import "@/widgets/main-screen";

const StatsPage = lazy(async () => {
	const m = await import("@/pages/stats");
	return { default: m.StatsPage };
});

const SettingsPage = lazy(async () => {
	const m = await import("@/pages/settings");
	return { default: m.SettingsPage };
});

function StatsRouteFallback() {
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

function SettingsRouteFallback() {
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

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/day/:dayKey" element={<DayPage />} />
			<Route
				path="/stats"
				element={
					<Suspense fallback={<StatsRouteFallback />}>
						<StatsPage />
					</Suspense>
				}
			/>
			<Route
				path="/settings"
				element={
					<Suspense fallback={<SettingsRouteFallback />}>
						<SettingsPage />
					</Suspense>
				}
			/>
			<Route path="*" element={<Navigate to="/day/today" replace />} />
		</Routes>
	);
}

function App() {
	return (
		<BrowserRouter>
			<AppShell>
				<AppRoutes />
			</AppShell>
		</BrowserRouter>
	);
}

export default App;
