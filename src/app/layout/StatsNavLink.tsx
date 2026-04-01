import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { COMMON_NS } from "@/shared/i18n";
import { navLinkClass, navLinkClassMobile } from "./app-shell-nav-styles";

type Props = {
	variant: "sidebar" | "bottom";
};

export function StatsNavLink({ variant }: Props) {
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
