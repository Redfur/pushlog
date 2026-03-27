import { useCallback } from "react";
import { usePushlogStore } from "@/entities/pushup";

export function useRemoveSet() {
	const removeSet = usePushlogStore((s) => s.removeSet);

	return useCallback(
		(id: string) => {
			void removeSet(id);
		},
		[removeSet],
	);
}
