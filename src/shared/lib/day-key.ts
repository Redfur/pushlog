/** Календарный день пользователя в формате YYYY-MM-DD. */
export type DayKey = string;

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
