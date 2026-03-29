/** Отображение веса в кг (без единицы — её даёт i18n). */
export function formatWeightKgDisplay(kg: number, locale?: string): string {
	try {
		return new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(kg);
	} catch {
		return String(kg);
	}
}

/** От этого порога тоннаж показывают в тоннах, а не в килограммах. */
const TONNAGE_DISPLAY_TONNES_THRESHOLD_KG = 1000;

function formatTonnageNumber(n: number, locale: string | undefined, maximumFractionDigits: number): string {
	try {
		return new Intl.NumberFormat(locale, {
			maximumFractionDigits,
			minimumFractionDigits: 0,
		}).format(n);
	} catch {
		return String(n);
	}
}

/**
 * Тоннаж для UI: при накопленной массе ≥ порога — в тоннах (т / t), иначе в кг.
 * Используйте для карточек, списков и подписей; значение всегда в килограммах на входе.
 */
export function formatTonnageMassDisplay(kg: number, locale?: string): string {
	if (!Number.isFinite(kg) || kg <= 0) {
		return `${formatTonnageNumber(0, locale, 2)}\u00A0кг`;
	}
	if (kg < TONNAGE_DISPLAY_TONNES_THRESHOLD_KG) {
		return `${formatTonnageNumber(kg, locale, 2)}\u00A0кг`;
	}
	const tonnes = kg / 1000;
	const tonSuffix = locale && /^ru/i.test(locale) ? "\u00A0т" : "\u00A0t";
	return `${formatTonnageNumber(tonnes, locale, 2)}${tonSuffix}`;
}

/** См. {@link formatTonnageMassDisplay} — то же отображение (кг или т). */
export function formatTonnageWithKgUnit(kg: number, locale?: string): string {
	return formatTonnageMassDisplay(kg, locale);
}
