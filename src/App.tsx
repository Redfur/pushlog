import { Activity, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePushlogStore } from "@/entities/pushup";
import { HomePage } from "@/pages/home";
import { StatsPage } from "@/pages/stats";
import { COMMON_NS } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";

import "@/widgets/main-screen";
import "@/widgets/stats";

function StorageErrorBanner() {
	const { t } = useTranslation(COMMON_NS);
	const lastError = usePushlogStore((s) => s.lastError);
	const clearError = usePushlogStore((s) => s.clearError);

	if (!lastError) return null;

	return (
		<div
			role="alert"
			className="bg-destructive text-destructive-foreground fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-2 px-3 py-2 text-sm"
		>
			<span className="min-w-0 flex-1 truncate">{t("storageError", { message: lastError })}</span>
			<Button type="button" size="sm" variant="secondary" onClick={() => clearError()}>
				{t("ok")}
			</Button>
		</div>
	);
}

function AppShell() {
	const { t } = useTranslation(COMMON_NS);
	const lastError = usePushlogStore((s) => s.lastError);

	return (
		<div className="bg-background flex min-h-svh flex-col">
			<StorageErrorBanner />
			<main className={cn("flex flex-1 flex-col pb-16", lastError && "pt-10")}>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/stats" element={<StatsPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
			<nav className="bg-background/95 supports-[backdrop-filter]:bg-background/80 border-border fixed right-0 bottom-0 left-0 z-40 border-t backdrop-blur">
				<div className="mx-auto flex max-w-lg justify-around gap-2 p-2">
					<NavLink
						to="/"
						end
						className={({ isActive }) =>
							cn(
								"text-muted-foreground flex flex-1 flex-col items-center gap-1 rounded-md py-2 text-xs font-medium",
								isActive && "text-foreground bg-accent",
							)
						}
					>
						<Home className="size-5" />
						<span>{t("navHome")}</span>
					</NavLink>
					<NavLink
						to="/stats"
						className={({ isActive }) =>
							cn(
								"text-muted-foreground flex flex-1 flex-col items-center gap-1 rounded-md py-2 text-xs font-medium",
								isActive && "text-foreground bg-accent",
							)
						}
					>
						<Activity className="size-5" />
						<span>{t("navStats")}</span>
					</NavLink>
				</div>
			</nav>
		</div>
	);
}

function App() {
	return (
		<BrowserRouter>
			<AppShell />
		</BrowserRouter>
	);
}

export default App;
