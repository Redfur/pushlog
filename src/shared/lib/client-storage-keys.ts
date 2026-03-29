/** Единый список ключей client-side хранилища (для сброса и документации). */
export const CLIENT_STORAGE_KEYS = {
	theme: "push-log-theme",
	timeZone: "pushlog.timeZone",
	preferredExerciseType: "pushlog.preferredExerciseTypeId",
	/** JSON: Record<exerciseTypeId, { reps: string; weight: string }> */
	quickAddDraft: "pushlog.quickAddDraft.v1",
} as const;
