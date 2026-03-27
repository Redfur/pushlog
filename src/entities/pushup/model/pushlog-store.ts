import { create } from "zustand";
import { DEFAULT_EXERCISE_TYPE_ID } from "@/shared/config/pushlog";
import { getDefaultTimeZone, nowDayKey } from "@/shared/lib/day-key";
import { generateId } from "@/shared/lib/id";
import { getStorageAdapter } from "@/shared/lib/storage";
import type { Goal, PushlogSet } from "./types";

const SET_VERSION = 1;

type PushlogState = {
	sets: PushlogSet[];
	goal: Goal | null;
	hydrated: boolean;
	lastError: string | null;
	timeZone: string;
	hydrate: () => Promise<void>;
	addSet: (reps: number) => Promise<void>;
	removeSet: (id: string) => Promise<void>;
	clearError: () => void;
};

export const usePushlogStore = create<PushlogState>((set, get) => ({
	sets: [],
	goal: null,
	hydrated: false,
	lastError: null,
	timeZone: getDefaultTimeZone(),

	clearError: () => set({ lastError: null }),

	hydrate: async () => {
		const storage = getStorageAdapter();
		try {
			const [loadedSets, goal] = await Promise.all([storage.getAllSets(), storage.getGoal()]);
			set({
				sets: loadedSets,
				goal,
				hydrated: true,
				lastError: null,
				timeZone: getDefaultTimeZone(),
			});
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ lastError: message, hydrated: true });
		}
	},

	addSet: async (reps: number) => {
		if (reps <= 0 || !Number.isFinite(reps)) return;

		const { timeZone } = get();
		const row: PushlogSet = {
			id: generateId(),
			exerciseTypeId: DEFAULT_EXERCISE_TYPE_ID,
			reps: Math.floor(reps),
			createdAt: new Date().toISOString(),
			dayKey: nowDayKey(timeZone),
			version: SET_VERSION,
		};

		set((s) => ({ sets: [...s.sets, row], lastError: null }));

		try {
			await getStorageAdapter().putSet(row);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set((s) => ({
				lastError: message,
				sets: s.sets.filter((x) => x.id !== row.id),
			}));
		}
	},

	removeSet: async (id: string) => {
		const prev = get().sets;
		const removed = prev.find((x) => x.id === id);
		if (!removed) return;

		set({ sets: prev.filter((x) => x.id !== id), lastError: null });

		try {
			await getStorageAdapter().deleteSet(id);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ sets: prev, lastError: message });
		}
	},
}));
