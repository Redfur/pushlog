import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePushlogStore } from "@/entities/pushup";
import { TimezoneSelect } from "@/features/set-timezone";
import { METRIKA_GOALS } from "@/shared/config/metrika-goals";
import { readAnalyticsGoalsEnabled, writeAnalyticsGoalsEnabled } from "@/shared/lib/analytics-goals-preference";
import { clearClientStoragePreferences } from "@/shared/lib/clear-client-storage";
import { pushlogAnalytics } from "@/shared/lib/pushlog-analytics";
import { wipePushlogIndexedDatabase } from "@/shared/lib/storage";
import {
	getThemePreference,
	setThemePreference,
	THEME_CHANGE_EVENT,
	type ThemeChangeDetail,
	type ThemePreference,
} from "@/shared/lib/theme";
import { TIMEZONE_AUTO_SELECT_VALUE } from "@/shared/lib/timezone-preference";
import { cn } from "@/shared/lib/utils";
import { SETTINGS_SCREEN_NS } from "../translations";

function AnalyticsGoalsRow() {
	const { t } = useTranslation(SETTINGS_SCREEN_NS);
	const [enabled, setEnabled] = useState(() => readAnalyticsGoalsEnabled());

	return (
		<div className="border-border/50 text-muted-foreground rounded-md border border-dashed px-3 py-2.5">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 space-y-0.5">
					<p className="text-xs leading-snug">{t("analyticsGoalsLabel")}</p>
					<p className="text-[11px] leading-snug opacity-90">{t("analyticsGoalsHint")}</p>
				</div>
				<Switch
					size="sm"
					className="shrink-0"
					checked={enabled}
					onCheckedChange={(v) => {
						if (!v) {
							pushlogAnalytics.reachGoal(METRIKA_GOALS.settingsAnalyticsToggle, { enabled: 0 });
							writeAnalyticsGoalsEnabled(false);
						} else {
							writeAnalyticsGoalsEnabled(true);
							pushlogAnalytics.reachGoal(METRIKA_GOALS.settingsAnalyticsToggle, { enabled: 1 });
						}
						setEnabled(v);
					}}
					aria-label={t("analyticsGoalsLabel")}
				/>
			</div>
		</div>
	);
}

function ThemePreferenceSelect({ labelId }: { labelId: string }) {
	const { t } = useTranslation(SETTINGS_SCREEN_NS);
	const [preference, setPreference] = useState<ThemePreference>(() => getThemePreference());

	useEffect(() => {
		const onChange = (e: Event) => {
			const ce = e as CustomEvent<ThemeChangeDetail>;
			if (ce.detail?.preference) setPreference(ce.detail.preference);
		};
		window.addEventListener(THEME_CHANGE_EVENT, onChange);
		return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
	}, []);

	return (
		<Select
			value={preference}
			onValueChange={(v) => {
				if (v !== "system" && v !== "light" && v !== "dark") return;
				setThemePreference(v);
				setPreference(v);
			}}
		>
			<SelectTrigger id="theme-pref-select" aria-labelledby={labelId} className="max-w-full min-w-0 w-full">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="system">{t("themeSystem")}</SelectItem>
				<SelectItem value="light">{t("themeLight")}</SelectItem>
				<SelectItem value="dark">{t("themeDark")}</SelectItem>
			</SelectContent>
		</Select>
	);
}

export function SettingsScreen() {
	const { t } = useTranslation(SETTINGS_SCREEN_NS);
	const setTimeZone = usePushlogStore((s) => s.setTimeZone);

	const handleClearIndexedDb = async () => {
		await wipePushlogIndexedDatabase();
		pushlogAnalytics.reachGoal(METRIKA_GOALS.settingsDataClearIndexedDb);
		window.location.reload();
	};

	const handleClearLocalPreferences = () => {
		clearClientStoragePreferences();
		setTimeZone(TIMEZONE_AUTO_SELECT_VALUE);
		pushlogAnalytics.reachGoal(METRIKA_GOALS.settingsDataClearLocalPreferences);
	};

	const handleClearAll = async () => {
		await wipePushlogIndexedDatabase();
		clearClientStoragePreferences();
		setTimeZone(TIMEZONE_AUTO_SELECT_VALUE);
		pushlogAnalytics.reachGoal(METRIKA_GOALS.settingsDataClearAll);
		window.location.reload();
	};

	return (
		<div className="animate-in fade-in flex flex-col gap-4 py-4 duration-300">
			<h1 className="text-xl font-semibold">{t("title")}</h1>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium" id="settings-theme-heading">
						{t("themeSection")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ThemePreferenceSelect labelId="settings-theme-heading" />
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium" id="settings-lang-heading">
						{t("languageSection")}
					</CardTitle>
					<CardDescription className="text-xs">{t("languageHint")}</CardDescription>
				</CardHeader>
				<CardContent>
					<Select disabled value="ru">
						<SelectTrigger
							id="language-select"
							aria-labelledby="settings-lang-heading"
							className="max-w-full min-w-0 w-full"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ru">{t("languageCurrent")}</SelectItem>
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">{t("regionSection")}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<p className="text-muted-foreground text-xs leading-snug">
						{t("exercisesCatalogHint")}{" "}
						<Link to="/" className="text-primary font-medium underline-offset-4 hover:underline">
							{t("exercisesCatalogLink")}
						</Link>
					</p>
					<p className="text-muted-foreground text-xs leading-snug">
						{t("dailyGoalHint")}{" "}
						<Link to="/" className="text-primary font-medium underline-offset-4 hover:underline">
							{t("dailyGoalLink")}
						</Link>
					</p>
					<TimezoneSelect />
				</CardContent>
			</Card>

			<AnalyticsGoalsRow />

			<Card className="border-destructive/40">
				<CardHeader className="pb-2">
					<CardTitle className="text-destructive text-sm font-medium">{t("dangerSection")}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<ConfirmDangerRow
						description={t("clearIndexedDbDetail")}
						title={t("clearIndexedDbConfirm")}
						body={t("clearIndexedDbDetail")}
						confirmLabel={t("confirmAction")}
						cancelLabel={t("cancelDialog")}
						triggerLabel={t("clearIndexedDb")}
						onConfirm={() => void handleClearIndexedDb()}
					/>
					<ConfirmDangerRow
						description={t("clearLocalStorageDetail")}
						title={t("clearLocalStorageConfirm")}
						body={t("clearLocalStorageDetail")}
						confirmLabel={t("confirmAction")}
						cancelLabel={t("cancelDialog")}
						triggerLabel={t("clearLocalStorage")}
						onConfirm={handleClearLocalPreferences}
					/>
					<ConfirmDangerRow
						description={t("clearAllDetail")}
						title={t("clearAllConfirm")}
						body={t("clearAllDetail")}
						confirmLabel={t("confirmAction")}
						cancelLabel={t("cancelDialog")}
						triggerLabel={t("clearAll")}
						onConfirm={() => void handleClearAll()}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

type ConfirmDangerRowProps = {
	triggerLabel: string;
	title: string;
	body: string;
	description: string;
	confirmLabel: string;
	cancelLabel: string;
	onConfirm: () => void | Promise<void>;
};

function ConfirmDangerRow({
	triggerLabel,
	title,
	body,
	description,
	confirmLabel,
	cancelLabel,
	onConfirm,
}: ConfirmDangerRowProps) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium">{triggerLabel}</p>
				<p className="text-muted-foreground mt-0.5 text-xs leading-snug">{description}</p>
			</div>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button type="button" variant="destructive" className="shrink-0">
						{triggerLabel}
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{title}</AlertDialogTitle>
						<AlertDialogDescription>{body}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
						<AlertDialogAction
							className={cn(buttonVariants({ variant: "destructive" }))}
							onClick={() => void onConfirm()}
						>
							{confirmLabel}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
