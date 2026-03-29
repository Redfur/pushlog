/** Не входит в CLIENT_STORAGE_KEYS: не сбрасывается при «Сбросить настройки интерфейса» и «Очистить всё». */
const STORAGE_KEY = "pushlog.analyticsGoalsEnabled";

/** По умолчанию отправка целей включена. */
export function readAnalyticsGoalsEnabled(): boolean {
	if (typeof localStorage === "undefined") return true;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw === null) return true;
		return raw === "1" || raw === "true";
	} catch {
		return true;
	}
}

export function writeAnalyticsGoalsEnabled(enabled: boolean): void {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
	} catch {
		/* ignore */
	}
}
