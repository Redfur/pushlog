import type { DayKey } from "@/shared/lib/day-key";
import { computeStats } from "./compute-stats";
import { filterSetsByExerciseTypeId } from "./day-sets";
import type { PushlogSet, Stats } from "./types";

export function computeStatsForExerciseType(
	sets: PushlogSet[],
	exerciseTypeId: string,
	todayDayKey: DayKey,
	timeZone: string,
): Stats {
	return computeStats(filterSetsByExerciseTypeId(sets, exerciseTypeId), todayDayKey, timeZone);
}
