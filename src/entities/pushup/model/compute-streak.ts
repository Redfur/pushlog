import { type DayKey, offsetDayKey } from "@/shared/lib/day-key";
import type { PushlogSet } from "./types";

/**
 * Подряд идущие календарные дни с ≥1 подходом, считая от todayDayKey назад (если сегодня пусто — 0).
 */
export function computeStreak(sets: PushlogSet[], todayDayKey: DayKey, timeZone: string): number {
	const active = new Set(sets.map((s) => s.dayKey));
	let streak = 0;
	let d = todayDayKey;
	while (active.has(d)) {
		streak += 1;
		d = offsetDayKey(d, -1, timeZone);
	}
	return streak;
}
