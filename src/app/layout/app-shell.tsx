import { Activity, Home } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePushlogStore } from "@/entities/pushup";
import { useTodayDayKey } from "@/hooks/use-today-day-key";
import { COMMON_NS } from "@/shared/i18n";
import { resolveDayRouteParam } from "@/shared/lib/day-key";
import { cn } from "@/shared/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	cn(
		"text-muted-foreground flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
		isActive && "bg-accent text-foreground",
	);

const navLinkClassMobile = ({ isActive }: { isActive: boolean }) =>
	cn(
		"text-muted-foreground flex flex-1 flex-col items-center gap-1 rounded-md py-2 text-xs font-medium",
		isActive && "bg-accent text-foreground",
	);

function HomeNavLink({ variant }: { variant: "sidebar" | "bottom" }) {
	const { t } = useTranslation(COMMON_NS);
	const loc = useLocation();
	const timeZone = usePushlogStore((s) => s.timeZone);
	const todayK = useTodayDayKey(timeZone);
	const m = loc.pathname.match(/^\/day\/([^/]+)$/);
	const resolved = m?.[1] ? resolveDayRouteParam(m[1], timeZone) : null;
	const isViewingToday = resolved !== null && resolved === todayK;

	if (variant === "sidebar") {
		return (
			<NavLink to="/day/today" className={({ isActive }) => navLinkClass({ isActive: isActive || isViewingToday })}>
				<Home className="size-5 shrink-0" />
				<span>{t("navHome")}</span>
			</NavLink>
		);
	}

	return (
		<NavLink to="/day/today" className={({ isActive }) => navLinkClassMobile({ isActive: isActive || isViewingToday })}>
			<Home className="size-5" />
			<span>{t("navHome")}</span>
		</NavLink>
	);
}

function StatsNavLink({ variant }: { variant: "sidebar" | "bottom" }) {
	const { t } = useTranslation(COMMON_NS);
	if (variant === "sidebar") {
		return (
			<NavLink to="/stats" className={({ isActive }) => navLinkClass({ isActive })}>
				<Activity className="size-5 shrink-0" />
				<span>{t("navStats")}</span>
			</NavLink>
		);
	}
	return (
		<NavLink to="/stats" className={({ isActive }) => navLinkClassMobile({ isActive })}>
			<Activity className="size-5" />
			<span>{t("navStats")}</span>
		</NavLink>
	);
}

function StorageErrorBanner() {
	const { t } = useTranslation(COMMON_NS);
	const lastError = usePushlogStore((s) => s.lastError);
	const clearError = usePushlogStore((s) => s.clearError);

	if (!lastError) return null;

	return (
		<div
			role="alert"
			className="bg-destructive text-destructive-foreground fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-2 px-3 py-2 text-sm lg:left-64"
		>
			<span className="min-w-0 flex-1 truncate">{t("storageError", { message: lastError })}</span>
			<Button type="button" size="sm" variant="secondary" onClick={() => clearError()}>
				{t("ok")}
			</Button>
		</div>
	);
}

type Props = {
	children: ReactNode;
};

/**
 * Десктоп: фиксированный сайдбар слева; мобилка: нижняя навигация.
 * Контент в центрированной колонке ограниченной ширины.
 */
export function AppShell({ children }: Props) {
	const lastError = usePushlogStore((s) => s.lastError);

	return (
		<div className="bg-background flex min-h-svh flex-col">
			<StorageErrorBanner />

			<aside className="border-border bg-background fixed top-0 left-0 z-30 hidden h-svh w-64 flex-col border-r pt-4 lg:flex">
				<nav className="flex flex-col gap-1 p-3">
					<HomeNavLink variant="sidebar" />
					<StatsNavLink variant="sidebar" />
				</nav>
			</aside>

			<main className={cn("flex flex-1 flex-col pb-20 lg:pb-8 lg:pl-64", lastError && "pt-10")}>
				<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6 lg:max-w-4xl lg:py-2">
					{children}
				</div>
			</main>

			<nav className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed right-0 bottom-0 left-0 z-40 border-t backdrop-blur lg:hidden">
				<div className="mx-auto flex max-w-lg justify-around gap-2 p-2">
					<HomeNavLink variant="bottom" />
					<StatsNavLink variant="bottom" />
				</div>
			</nav>
		</div>
	);
}
