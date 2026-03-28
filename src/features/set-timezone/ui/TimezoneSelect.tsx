import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePushlogStore } from "@/entities/pushup";
import { getDefaultTimeZone } from "@/shared/lib/day-key";
import { readStoredTimeZone, TIMEZONE_AUTO_SELECT_VALUE } from "@/shared/lib/timezone-preference";
import { SET_TIMEZONE_NS } from "../translations";

function timeZoneOptions(): string[] {
	try {
		if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
			return Intl.supportedValuesOf("timeZone");
		}
	} catch {
		/* ignore */
	}
	return [];
}

export function TimezoneSelect() {
	const { t } = useTranslation(SET_TIMEZONE_NS);
	const setTimeZone = usePushlogStore((s) => s.setTimeZone);

	const zones = useMemo(() => timeZoneOptions(), []);

	const stored = readStoredTimeZone();
	const selectValue = stored ?? TIMEZONE_AUTO_SELECT_VALUE;

	return (
		<div className="flex flex-col gap-2">
			<div>
				<label className="text-muted-foreground text-xs font-medium" htmlFor="tz-select">
					{t("label")}
				</label>
				<p className="text-muted-foreground mt-0.5 text-[11px] leading-snug">{t("hint")}</p>
			</div>
			<Select value={selectValue} onValueChange={setTimeZone}>
				<SelectTrigger id="tz-select" className="max-w-full min-w-0 w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent className="max-h-[min(50vh,20rem)]">
					<SelectItem value={TIMEZONE_AUTO_SELECT_VALUE}>
						{t("auto")} ({getDefaultTimeZone()})
					</SelectItem>
					{zones.map((z) => (
						<SelectItem key={z} value={z}>
							{z}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
