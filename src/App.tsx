import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/app/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { DayPage } from "@/pages/day";
import { HomePage } from "@/pages/home";
import { COMMON_NS } from "@/shared/i18n";

import "@/widgets/home-screen";
import "@/widgets/main-screen";

const StatsPage = lazy(async () => {
	const m = await import("@/pages/stats");
	return { default: m.StatsPage };
});

const SettingsPage = lazy(async () => {
	const m = await import("@/pages/settings");
	return { default: m.SettingsPage };
});

const StatsExercisePage = lazy(async () => {
	const m = await import("@/pages/stats-exercise");
	return { default: m.StatsExercisePage };
});

const ExercisePage = lazy(async () => {
	const m = await import("@/pages/exercise-detail");
	return { default: m.ExercisePage };
});

const ExerciseEditPage = lazy(async () => {
	const m = await import("@/pages/exercise-detail");
	return { default: m.ExerciseEditPage };
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

function ExerciseRouteFallback() {
	return (
		<div className="flex flex-col gap-4 py-4">
			<Skeleton className="h-8 w-48" />
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
				path="/exercises/new"
				element={
					<Suspense fallback={<ExerciseRouteFallback />}>
						<ExercisePage />
					</Suspense>
				}
			/>
			<Route
				path="/exercises/:exerciseId/edit"
				element={
					<Suspense fallback={<ExerciseRouteFallback />}>
						<ExerciseEditPage />
					</Suspense>
				}
			/>
			<Route
				path="/exercises/:exerciseId"
				element={
					<Suspense fallback={<ExerciseRouteFallback />}>
						<ExercisePage />
					</Suspense>
				}
			/>
			<Route
				path="/stats/exercise/:exerciseId"
				element={
					<Suspense fallback={<StatsRouteFallback />}>
						<StatsExercisePage />
					</Suspense>
				}
			/>
			<Route
				path="/stats"
				element={
					<Suspense fallback={<StatsRouteFallback />}>
						<StatsPage />
					</Suspense>
				}
			/>
			<Route path="/settings/exercises" element={<Navigate to="/" replace />} />
			<Route
				path="/settings"
				element={
					<Suspense fallback={<SettingsRouteFallback />}>
						<SettingsPage />
					</Suspense>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<AppShell>
				<AppRoutes />
			</AppShell>
		</BrowserRouter>
	);
}

export default App;
