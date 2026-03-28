import { CLIENT_STORAGE_KEYS } from "@/shared/lib/client-storage-keys";

const STORAGE_KEY = CLIENT_STORAGE_KEYS.timeZone;

/** Значение опции «авто» для выбора часового пояса (не IANA). */
export const TIMEZONE_AUTO_SELECT_VALUE = "__auto__";

function supportedTimeZones(): string[] {
	try {
		if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
			return Intl.supportedValuesOf("timeZone");
		}
	} catch {
		/* ignore */
	}
	return [];
}

/** Проверка, что строка — допустимая IANA-зона в текущей среде. */
export function isValidTimeZoneId(value: string): boolean {
	if (!value) return false;
	const list = supportedTimeZones();
	if (list.length > 0) return list.includes(value);
	try {
		Intl.DateTimeFormat(undefined, { timeZone: value });
		return true;
	} catch {
		return false;
	}
}

export function readStoredTimeZone(): string | null {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return isValidTimeZoneId(raw) ? raw : null;
	} catch {
		return null;
	}
}

export function writeStoredTimeZone(timeZone: string): void {
	try {
		localStorage.setItem(STORAGE_KEY, timeZone);
	} catch {
		/* ignore */
	}
}

export function clearStoredTimeZone(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		/* ignore */
	}
}
