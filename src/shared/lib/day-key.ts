/** Календарный день пользователя в формате YYYY-MM-DD. */
export type DayKey = string;

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function getDefaultTimeZone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * День в указанной IANA timezone для момента времени `date` (UTC хранится в Date).
 */
export function dayKeyFromDate(date: Date, timeZone: string): DayKey {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);

	const y = parts.find((p) => p.type === "year")?.value;
	const m = parts.find((p) => p.type === "month")?.value;
	const d = parts.find((p) => p.type === "day")?.value;
	if (!y || !m || !d) {
		throw new Error("dayKeyFromDate: invalid Intl parts");
	}
	return `${y}-${m}-${d}`;
}

export function nowDayKey(timeZone = getDefaultTimeZone()): DayKey {
	return dayKeyFromDate(new Date(), timeZone);
}

/** Сдвиг календарного дня (по григорианскому UTC-сложению дат, затем проекция в timezone). */
export function offsetDayKey(dayKey: DayKey, offsetDays: number, timeZone: string): DayKey {
	const [y, m, d] = dayKey.split("-").map(Number);
	const utc = new Date(Date.UTC(y, m - 1, d + offsetDays));
	return dayKeyFromDate(utc, timeZone);
}

export function isValidDayKey(value: string): boolean {
	if (!DAY_KEY_RE.test(value)) return false;
	const [y, m, d] = value.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/**
 * Сегмент URL: `today`, `yesterday` или `YYYY-MM-DD`.
 */
export function resolveDayRouteParam(param: string | undefined, timeZone: string): DayKey | null {
	if (!param) return null;
	if (param === "today") return nowDayKey(timeZone);
	if (param === "yesterday") return offsetDayKey(nowDayKey(timeZone), -1, timeZone);
	if (!isValidDayKey(param)) return null;
	return param;
}

/** Можно ли логировать подходы за этот день (не будущее). */
export function canLogSetsForDay(dayKey: DayKey, timeZone: string): boolean {
	return dayKey <= nowDayKey(timeZone);
}

/** Локальная дата полуночи для `dayKey` (для календаря в UI). */
export function dayKeyToLocalDate(dayKey: DayKey): Date {
	const [y, m, d] = dayKey.split("-").map(Number);
	return new Date(y, m - 1, d);
}

/** Обратно в `dayKey` из выбранной в календаре локальной даты. */
export function localDateToDayKey(date: Date): DayKey {
	const y = date.getFullYear();
	const mo = String(date.getMonth() + 1).padStart(2, "0");
	const da = String(date.getDate()).padStart(2, "0");
	return `${y}-${mo}-${da}`;
}
