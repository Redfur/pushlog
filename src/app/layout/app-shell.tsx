import { Activity, CalendarDays, Home, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePushlogStore } from "@/entities/pushup";
import { COMMON_NS } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	cn(
		"text-muted-foreground flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
		isActive && "bg-accent text-foreground",
	);

const navLinkClassMobile = ({ isActive }: { isActive: boolean }) =>
	cn(
		"text-muted-foreground flex flex-1 flex-col items-center gap-1 rounded-md py-2 text-[11px] font-medium leading-tight sm:text-xs",
		isActive && "bg-accent text-foreground",
	);

function HomeNavLink({ variant }: { variant: "sidebar" | "bottom" }) {
	const { t } = useTranslation(COMMON_NS);
	const loc = useLocation();
	const isHome = loc.pathname === "/";

	if (variant === "sidebar") {
		return (
			<NavLink to="/" className={({ isActive }) => navLinkClass({ isActive: isActive || isHome })}>
				<Home className="size-5 shrink-0" />
				<span>{t("navHome")}</span>
			</NavLink>
		);
	}

	return (
		<NavLink to="/" className={({ isActive }) => navLinkClassMobile({ isActive: isActive || isHome })}>
			<Home className="size-5" />
			<span>{t("navHome")}</span>
		</NavLink>
	);
}

function DayNavLink({ variant }: { variant: "sidebar" | "bottom" }) {
	const { t } = useTranslation(COMMON_NS);
	const loc = useLocation();
	const isDaySection = loc.pathname.startsWith("/day/");

	if (variant === "sidebar") {
		return (
			<NavLink to="/day/today" className={({ isActive }) => navLinkClass({ isActive: isActive || isDaySection })}>
				<CalendarDays className="size-5 shrink-0" />
				<span>{t("navDay")}</span>
			</NavLink>
		);
	}

	return (
		<NavLink to="/day/today" className={({ isActive }) => navLinkClassMobile({ isActive: isActive || isDaySection })}>
			<CalendarDays className="size-5" />
			<span>{t("navDay")}</span>
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

function SettingsNavLink({ variant }: { variant: "sidebar" | "bottom" }) {
	const { t } = useTranslation(COMMON_NS);
	if (variant === "sidebar") {
		return (
			<NavLink to="/settings" className={({ isActive }) => navLinkClass({ isActive })}>
				<Settings className="size-5 shrink-0" />
				<span>{t("navSettings")}</span>
			</NavLink>
		);
	}
	return (
		<NavLink to="/settings" className={({ isActive }) => navLinkClassMobile({ isActive })}>
			<Settings className="size-5" />
			<span>{t("navSettings")}</span>
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
					<DayNavLink variant="sidebar" />
					<StatsNavLink variant="sidebar" />
					<SettingsNavLink variant="sidebar" />
				</nav>
			</aside>

			<main className={cn("flex flex-1 flex-col pb-20 lg:pb-8 lg:pl-64", lastError && "pt-10")}>
				<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6 lg:max-w-4xl lg:py-2">
					{children}
				</div>
			</main>

			<nav className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed right-0 bottom-0 left-0 z-40 border-t backdrop-blur lg:hidden">
				<div className="mx-auto flex max-w-2xl justify-between gap-0.5 px-1 py-2 sm:gap-1">
					<HomeNavLink variant="bottom" />
					<DayNavLink variant="bottom" />
					<StatsNavLink variant="bottom" />
					<SettingsNavLink variant="bottom" />
				</div>
			</nav>
		</div>
	);
}
