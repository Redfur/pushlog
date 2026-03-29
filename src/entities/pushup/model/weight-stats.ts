import type { DayKey } from "@/shared/lib/day-key";
import type { PushlogSet } from "./types";

/** Максимальный вес среди подходов с заполненным `weightValue` (кг). */
export function maxWeightAllTime(sets: PushlogSet[]): number | null {
	let max: number | null = null;
	for (const s of sets) {
		const w = s.weightValue;
		if (w != null && Number.isFinite(w) && w > 0) {
			if (max == null || w > max) max = w;
		}
	}
	return max;
}

type DailyMaxWeightPoint = {
	dayKey: DayKey;
	/** null — в этот день не было подходов с весом */
	maxWeight: number | null;
};

/** Для каждого дня из списка — максимальный вес среди подходов за этот день. */
export function buildDailyMaxWeightSeries(sets: PushlogSet[], dayKeys: DayKey[]): DailyMaxWeightPoint[] {
	const map = new Map<DayKey, number>();
	for (const s of sets) {
		const w = s.weightValue;
		if (w == null || !Number.isFinite(w) || w <= 0) continue;
		const prev = map.get(s.dayKey);
		if (prev === undefined || w > prev) map.set(s.dayKey, w);
	}
	return dayKeys.map((dayKey) => ({
		dayKey,
		maxWeight: map.get(dayKey) ?? null,
	}));
}
