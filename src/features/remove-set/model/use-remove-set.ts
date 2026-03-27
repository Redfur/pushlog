import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { usePushlogStore } from "@/entities/pushup";
import { COMMON_NS } from "@/shared/i18n";

export function useRemoveSet() {
	const { t } = useTranslation(COMMON_NS);
	const removeSet = usePushlogStore((s) => s.removeSet);
	const restoreSet = usePushlogStore((s) => s.restoreSet);

	return useCallback(
		async (id: string) => {
			const row = usePushlogStore.getState().sets.find((s) => s.id === id);
			if (!row) return;
			const ok = await removeSet(id);
			if (ok) {
				toast.success(t("toastRemoved"), {
					action: {
						label: t("undo"),
						onClick: () => {
							void restoreSet(row);
						},
					},
				});
			}
		},
		[removeSet, restoreSet, t],
	);
}
