import { useCallback, useEffect, useState } from "react";
import {
	readCustomQuickAddPresets,
	rememberCustomQuickAddPreset,
	removeCustomQuickAddPreset,
} from "@/shared/lib/quick-add-presets-storage";

export function useCustomQuickAddPresets() {
	const [customPresets, setCustomPresets] = useState<number[]>(() => readCustomQuickAddPresets());

	useEffect(() => {
		const onStorage = () => setCustomPresets(readCustomQuickAddPresets());
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
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
