import { useCallback, useEffect, useState } from "react";
import { CLIENT_STORAGE_CLEARED_EVENT } from "@/shared/lib/clear-client-storage";
import {
	readCustomQuickAddPresets,
	rememberCustomQuickAddPreset,
	removeCustomQuickAddPreset,
} from "@/shared/lib/quick-add-presets-storage";

export function useCustomQuickAddPresets() {
	const [customPresets, setCustomPresets] = useState<number[]>(() => readCustomQuickAddPresets());

	useEffect(() => {
		const sync = () => setCustomPresets(readCustomQuickAddPresets());
		const onStorage = () => sync();
		window.addEventListener("storage", onStorage);
		window.addEventListener(CLIENT_STORAGE_CLEARED_EVENT, sync);
		return () => {
			window.removeEventListener("storage", onStorage);
			window.removeEventListener(CLIENT_STORAGE_CLEARED_EVENT, sync);
		};
	}, []);

	const rememberPreset = useCallback((reps: number) => {
		rememberCustomQuickAddPreset(reps);
		setCustomPresets(readCustomQuickAddPresets());
	}, []);

	const removePreset = useCallback((reps: number) => {
		removeCustomQuickAddPreset(reps);
		setCustomPresets(readCustomQuickAddPresets());
	}, []);

	return { customPresets, rememberPreset, removePreset };
}
