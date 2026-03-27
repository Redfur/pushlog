import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	getResolvedTheme,
	initTheme,
	setThemePreference,
	THEME_CHANGE_EVENT,
	type Theme,
	type ThemeChangeDetail,
} from "@/shared/lib/theme";

export function ThemeToggle() {
	const [resolved, setResolved] = useState<Theme>(() => getResolvedTheme());

	useEffect(() => {
		initTheme();
		setResolved(getResolvedTheme());
		const onChange = (e: Event) => {
			const ce = e as CustomEvent<ThemeChangeDetail>;
			if (ce.detail?.resolved) {
				setResolved(ce.detail.resolved);
			} else {
				setResolved(getResolvedTheme());
			}
		};
		window.addEventListener(THEME_CHANGE_EVENT, onChange);
		return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
	}, []);

	const toggle = useCallback(() => {
		const next: Theme = resolved === "dark" ? "light" : "dark";
		setThemePreference(next);
		setResolved(next);
	}, [resolved]);

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggle}
			title={resolved === "dark" ? "Светлая тема" : "Тёмная тема"}
			aria-label={resolved === "dark" ? "Светлая тема" : "Тёмная тема"}
		>
			{resolved === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
		</Button>
	);
}
