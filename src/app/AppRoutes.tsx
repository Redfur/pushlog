import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DayPage } from "@/pages/day";
import { HomePage } from "@/pages/home";

import "@/widgets/home-screen";
import "@/widgets/main-screen";
import { ExerciseRouteFallback, SettingsRouteFallback, StatsRouteFallback } from "./route-fallbacks";

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

export function AppRoutes() {
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
