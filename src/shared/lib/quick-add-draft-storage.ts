import { CLIENT_STORAGE_KEYS } from "@/shared/lib/client-storage-keys";

type QuickAddDraft = {
	reps: string;
	weight: string;
};

function readAll(): Record<string, QuickAddDraft> {
	if (typeof localStorage === "undefined") return {};
	try {
		const raw = localStorage.getItem(CLIENT_STORAGE_KEYS.quickAddDraft);
		if (!raw) return {};
		const p = JSON.parse(raw) as unknown;
		if (!p || typeof p !== "object" || Array.isArray(p)) return {};
		return p as Record<string, QuickAddDraft>;
	} catch {
		return {};
	}
}

export function loadQuickAddDraft(exerciseTypeId: string): QuickAddDraft | null {
	if (!exerciseTypeId) return null;
	const d = readAll()[exerciseTypeId];
	if (!d || typeof d.reps !== "string" || typeof d.weight !== "string") return null;
	return { reps: d.reps, weight: d.weight };
}

export function saveQuickAddDraft(exerciseTypeId: string, draft: QuickAddDraft): void {
	if (typeof localStorage === "undefined" || !exerciseTypeId) return;
	try {
		const all = readAll();
		all[exerciseTypeId] = { reps: draft.reps, weight: draft.weight };
		localStorage.setItem(CLIENT_STORAGE_KEYS.quickAddDraft, JSON.stringify(all));
	} catch {
		/* quota / private mode */
	}
}
