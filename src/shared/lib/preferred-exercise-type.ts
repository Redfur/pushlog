import { CLIENT_STORAGE_KEYS } from "@/shared/lib/client-storage-keys";

/** Сырое значение предпочитаемого типа упражнения из localStorage (UUID). */
export function readStoredPreferredExerciseTypeRaw(): string | null {
	if (typeof localStorage === "undefined") return null;
	try {
		return localStorage.getItem(CLIENT_STORAGE_KEYS.preferredExerciseType);
	} catch {
		return null;
	}
}

export function writePreferredExerciseTypeId(id: string): void {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(CLIENT_STORAGE_KEYS.preferredExerciseType, id);
	} catch {
		/* ignore */
	}
}
