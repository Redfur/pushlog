import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getRepeatLastReps, usePushlogStore } from "@/entities/pushup";
import { COMMON_NS } from "@/shared/i18n";
import type { DayKey } from "@/shared/lib/day-key";
import { nowDayKey } from "@/shared/lib/day-key";

const TAP_GUARD_MS = 220;

export function useAddSet(dayKey: DayKey) {
	const { t } = useTranslation(COMMON_NS);
	const addSet = usePushlogStore((s) => s.addSet);
	const removeSet = usePushlogStore((s) => s.removeSet);
	const sets = usePushlogStore((s) => s.sets);
	const preferredExerciseTypeId = usePushlogStore((s) => s.preferredExerciseTypeId);
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
		(reps: number) =>
			runGuarded(async () => {
				const id = await addSet(reps, { dayKey });
				if (id) {
					toast.success(t("toastAdded"), {
						action: {
							label: t("undo"),
							onClick: () => {
								void removeSet(id);
							},
						},
					});
				}
			}),
		[addSet, dayKey, removeSet, runGuarded, t],
	);

	const repeatLast = useCallback(() => {
		const reps = getRepeatLastReps(sets, dayKey, preferredExerciseTypeId);
		if (reps === null) return;
		void runGuarded(async () => {
			const id = await addSet(reps, { dayKey });
			if (id) {
				toast.success(t("toastAdded"), {
					action: {
						label: t("undo"),
						onClick: () => {
							void removeSet(id);
						},
					},
				});
			}
		});
	}, [addSet, dayKey, preferredExerciseTypeId, removeSet, runGuarded, sets, t]);

	return { addReps, repeatLast };
}

/** Только для контекста «сегодня» без явного dayKey. */
export function useAddSetToday() {
	const timeZone = usePushlogStore((s) => s.timeZone);
	return useAddSet(nowDayKey(timeZone));
}
