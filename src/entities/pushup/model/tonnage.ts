import type { DayKey } from "@/shared/lib/day-key";
import type { PushlogSet } from "./types";

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

/** Тоннаж одного подхода: reps × weight (кг); без веса — 0. */
function tonnageKgForSet(s: PushlogSet): number {
	const w = s.weightValue;
	if (w == null || !Number.isFinite(w) || w <= 0) return 0;
	return s.reps * w;
}

export function totalTonnageForDayKey(sets: PushlogSet[], dayKey: DayKey): number {
	let t = 0;
	for (const s of sets) {
		if (s.dayKey !== dayKey) continue;
		t += tonnageKgForSet(s);
	}
	return round2(t);
}

/** Сумма тоннажа по подходам, чей `dayKey` входит в множество (например скользящее окно). */
export function totalTonnageForDayKeys(sets: PushlogSet[], dayKeys: Iterable<DayKey>): number {
	const set = new Set(dayKeys);
	let t = 0;
	for (const s of sets) {
		if (!set.has(s.dayKey)) continue;
		t += tonnageKgForSet(s);
	}
	return round2(t);
}

/** Суммарный тоннаж по всем подходам данного типа упражнения (кг×повторы). */
export function totalTonnageForExerciseType(sets: PushlogSet[], exerciseTypeId: string): number {
	let t = 0;
	for (const s of sets) {
		if (s.exerciseTypeId !== exerciseTypeId) continue;
		t += tonnageKgForSet(s);
	}
	return round2(t);
}

/** По каждому дню из списка — суммарный тоннаж за день. */
export function buildDailyTonnageSeries(sets: PushlogSet[], dayKeys: DayKey[]): { dayKey: DayKey; tonnage: number }[] {
	const map = new Map<DayKey, number>();
	for (const s of sets) {
		const add = tonnageKgForSet(s);
		if (add <= 0) continue;
		map.set(s.dayKey, (map.get(s.dayKey) ?? 0) + add);
	}
	return dayKeys.map((dayKey) => ({
		dayKey,
		tonnage: round2(map.get(dayKey) ?? 0),
	}));
}
