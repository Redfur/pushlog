import { CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { COMMON_NS } from "@/shared/i18n";
import { navLinkClass, navLinkClassMobile } from "./app-shell-nav-styles";

type Props = {
	variant: "sidebar" | "bottom";
};

export function DayNavLink({ variant }: Props) {
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
