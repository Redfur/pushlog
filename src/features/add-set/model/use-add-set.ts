import { useCallback, useRef } from "react";
import { getRepeatLastReps, usePushlogStore } from "@/entities/pushup";
import { nowDayKey } from "@/shared/lib/day-key";

const TAP_GUARD_MS = 220;

export function useAddSet() {
	const addSet = usePushlogStore((s) => s.addSet);
	const sets = usePushlogStore((s) => s.sets);
	const timeZone = usePushlogStore((s) => s.timeZone);
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

	const addPresetReps = useCallback((reps: number) => runGuarded(() => addSet(reps)), [addSet, runGuarded]);

	const repeatLast = useCallback(() => {
		const today = nowDayKey(timeZone);
		const reps = getRepeatLastReps(sets, today);
		if (reps === null) return;
		void runGuarded(() => addSet(reps));
	}, [addSet, runGuarded, sets, timeZone]);

	return { addPresetReps, repeatLast };
}
