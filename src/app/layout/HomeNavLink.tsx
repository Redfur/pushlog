import { Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { COMMON_NS } from "@/shared/i18n";
import { navLinkClass, navLinkClassMobile } from "./app-shell-nav-styles";

type Props = {
	variant: "sidebar" | "bottom";
};

export function HomeNavLink({ variant }: Props) {
	const { t } = useTranslation(COMMON_NS);
	const loc = useLocation();
	const isHomeSection = loc.pathname === "/" || loc.pathname.startsWith("/exercises/");

	if (variant === "sidebar") {
		return (
			<NavLink to="/" className={({ isActive }) => navLinkClass({ isActive: isActive || isHomeSection })}>
				<Home className="size-5 shrink-0" />
				<span>{t("navHome")}</span>
			</NavLink>
		);
	}

	return (
		<NavLink to="/" className={({ isActive }) => navLinkClassMobile({ isActive: isActive || isHomeSection })}>
			<Home className="size-5" />
			<span>{t("navHome")}</span>
		</NavLink>
	);
}
