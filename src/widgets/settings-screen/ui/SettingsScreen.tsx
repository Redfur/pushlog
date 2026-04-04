import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePushlogStore } from "@/entities/pushup";
import { TimezoneSelect } from "@/features/set-timezone";
import { METRIKA_GOALS } from "@/shared/config/metrika-goals";
import { PageHeader, ScreenBody } from "@/shared/layout";
import { clearClientStoragePreferences } from "@/shared/lib/clear-client-storage";
import { pushlogAnalytics } from "@/shared/lib/pushlog-analytics";
import { wipePushlogIndexedDatabase } from "@/shared/lib/storage";
import { TIMEZONE_AUTO_SELECT_VALUE } from "@/shared/lib/timezone-preference";
import { SETTINGS_SCREEN_NS } from "../translations";
import { AnalyticsGoalsRow } from "./AnalyticsGoalsRow";
import { ConfirmDangerRow } from "./ConfirmDangerRow";
import { SettingsAboutFooter } from "./SettingsAboutFooter";
import { ThemePreferenceSelect } from "./ThemePreferenceSelect";

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
		<ScreenBody gap="compact">
			<PageHeader title={t("title")} />

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

			<SettingsAboutFooter />
		</ScreenBody>
	);
}
