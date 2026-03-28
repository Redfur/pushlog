import type { DayKey } from "./day-key";

function dayKeyToLocalDate(dayKey: DayKey): Date {
	const [y, m, d] = dayKey.split("-").map(Number);
	return new Date(y, m - 1, d);
}

/** BCP 47 для `Intl` из кода языка i18next (`ru` → `ru-RU`). */
export function bcp47FromI18nLang(lang: string | undefined): string | undefined {
	if (!lang) return undefined;
	if (lang === "ru") return "ru-RU";
	return lang;
}

/** Полная дата (день недели, число, месяц, год) — тултипы, «лучший день», точная привязка к дню. */
export function formatDayKeyFull(dayKey: DayKey, locale?: string): string {
	const date = dayKeyToLocalDate(dayKey);
	return new Intl.DateTimeFormat(locale ?? undefined, {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(date);
}

/** Удобная подпись без года; порядок полей задаёт локаль (например «четверг, 4 мая»). */
export function formatDayKeyFriendly(dayKey: DayKey, locale?: string): string {
	const date = dayKeyToLocalDate(dayKey);
	return new Intl.DateTimeFormat(locale ?? undefined, {
		weekday: "long",
		day: "numeric",
		month: "long",
	}).format(date);
}
