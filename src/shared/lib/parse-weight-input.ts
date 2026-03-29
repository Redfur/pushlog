/** Вес в подходах хранится в кг; отображение — «кг» (настройка lb — отдельно). */

const SET_WEIGHT_MIN_KG = 0.01;
export const SET_WEIGHT_MAX_KG = 999.99;

/** Округление до 2 знаков после запятой для хранения. */
export function roundWeightKg(n: number): number {
	return Math.round(n * 100) / 100;
}

/** Парсинг поля ввода: запятая или точка как разделитель. */
export function parseWeightDraft(draft: string): number | null {
	const t = draft.trim().replace(",", ".");
	if (t === "") return null;
	const n = Number.parseFloat(t);
	if (!Number.isFinite(n)) return null;
	return n;
}

export function isValidSetWeightKg(n: number): boolean {
	return Number.isFinite(n) && n >= SET_WEIGHT_MIN_KG && n <= SET_WEIGHT_MAX_KG;
}
