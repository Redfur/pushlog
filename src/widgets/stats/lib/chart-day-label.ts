import type { DayKey } from "@/shared/lib/day-key";

/** Короткая подпись дня для оси X графиков статистики. */
export function shortDayLabel(dayKey: DayKey, locale: string | undefined): string {
	const [y, m, d] = dayKey.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	return new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "numeric",
	}).format(date);
}
