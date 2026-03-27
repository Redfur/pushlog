import type { DayKey } from "./day-key";

/** Подпись календарного дня для UI (локаль браузера). */
export function formatDayKeyLabel(dayKey: DayKey, locale?: string): string {
	const [y, m, d] = dayKey.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	return new Intl.DateTimeFormat(locale ?? undefined, {
		dateStyle: "long",
	}).format(date);
}
