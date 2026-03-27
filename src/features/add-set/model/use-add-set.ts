import { useCallback, useRef } from "react";
import { getRepeatLastReps, usePushlogStore } from "@/entities/pushup";
import type { DayKey } from "@/shared/lib/day-key";
import { nowDayKey } from "@/shared/lib/day-key";

const TAP_GUARD_MS = 220;

export function useAddSet(dayKey: DayKey) {
	const addSet = usePushlogStore((s) => s.addSet);
	const sets = usePushlogStore((s) => s.sets);
	const guard = useRef(false);

	const runGuarded = useCallback(async (fn: () => Promise<void>) => {
		if (guard.current) return;
		guard.current = true;
		try {
			await fn();
		} finally {
			window.setTimeout(() => {
				guard.current = false;
			}, TAP_GUARD_MS);
		}
	}, []);

	const addReps = useCallback(
		(reps: number) => runGuarded(() => addSet(reps, { dayKey })),
		[addSet, dayKey, runGuarded],
	);

	const repeatLast = useCallback(() => {
		const reps = getRepeatLastReps(sets, dayKey);
		if (reps === null) return;
		void runGuarded(() => addSet(reps, { dayKey }));
	}, [addSet, dayKey, runGuarded, sets]);

	return { addReps, repeatLast };
}

/** Только для контекста «сегодня» без явного dayKey. */
export function useAddSetToday() {
	const timeZone = usePushlogStore((s) => s.timeZone);
	return useAddSet(nowDayKey(timeZone));
}
