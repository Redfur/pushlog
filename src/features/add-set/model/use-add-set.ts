import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { usePushlogStore } from "@/entities/pushup";
import { COMMON_NS } from "@/shared/i18n";
import type { DayKey } from "@/shared/lib/day-key";

const TAP_GUARD_MS = 220;

export function useAddSet(dayKey: DayKey) {
	const { t } = useTranslation(COMMON_NS);
	const addSet = usePushlogStore((s) => s.addSet);
	const removeSet = usePushlogStore((s) => s.removeSet);
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
		(reps: number, weightKg?: number) =>
			runGuarded(async () => {
				const id = await addSet(reps, {
					dayKey,
					...(weightKg !== undefined ? { weightKg } : {}),
				});
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

	return { addReps };
}
