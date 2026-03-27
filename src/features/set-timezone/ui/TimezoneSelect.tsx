import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
			<select
				id="tz-select"
				className="border-input bg-background ring-offset-background focus-visible:ring-ring max-w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				value={selectValue}
				onChange={(e) => {
					setTimeZone(e.target.value);
				}}
			>
				<option value={TIMEZONE_AUTO_SELECT_VALUE}>
					{t("auto")} ({getDefaultTimeZone()})
				</option>
				{zones.map((z) => (
					<option key={z} value={z}>
						{z}
					</option>
				))}
			</select>
		</div>
	);
}
