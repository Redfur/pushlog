import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { METRIKA_GOALS } from "@/shared/config/metrika-goals";
import { readAnalyticsGoalsEnabled, writeAnalyticsGoalsEnabled } from "@/shared/lib/analytics-goals-preference";
import { pushlogAnalytics } from "@/shared/lib/pushlog-analytics";
import { SETTINGS_SCREEN_NS } from "../translations";

export function AnalyticsGoalsRow() {
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
