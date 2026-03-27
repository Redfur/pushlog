import { create } from "zustand";
import { DEFAULT_EXERCISE_TYPE_ID } from "@/shared/config/pushlog";
import { canLogSetsForDay, getDefaultTimeZone, nowDayKey } from "@/shared/lib/day-key";
import { generateId } from "@/shared/lib/id";
import { getStorageAdapter } from "@/shared/lib/storage";
import {
	clearStoredTimeZone,
	isValidTimeZoneId,
	readStoredTimeZone,
	TIMEZONE_AUTO_SELECT_VALUE,
	writeStoredTimeZone,
} from "@/shared/lib/timezone-preference";
import { sortSetsByCreatedAtAsc } from "./day-sets";
import type { Goal, PushlogSet } from "./types";

const SET_VERSION = 1;

type PushlogState = {
	sets: PushlogSet[];
	goal: Goal | null;
	hydrated: boolean;
	lastError: string | null;
	timeZone: string;
	hydrate: () => Promise<void>;
	/** `dayKey` — календарный день записи; по умолчанию «сегодня». Нельзя логировать за будущие дни. */
	addSet: (reps: number, options?: { dayKey?: string }) => Promise<string | undefined>;
	removeSet: (id: string) => Promise<boolean>;
	restoreSet: (row: PushlogSet) => Promise<boolean>;
	setDailyGoal: (targetRepsPerDay: number) => Promise<void>;
	clearDailyGoal: () => Promise<void>;
	setTimeZone: (timeZone: string) => void;
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
		const tz = readStoredTimeZone() ?? getDefaultTimeZone();
		try {
			const [loadedSets, goal] = await Promise.all([storage.getAllSets(), storage.getGoal()]);
			set({
				sets: loadedSets,
				goal,
				hydrated: true,
				lastError: null,
				timeZone: tz,
			});
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ lastError: message, hydrated: true, timeZone: tz });
		}
	},

	setTimeZone: (timeZone: string) => {
		if (timeZone === TIMEZONE_AUTO_SELECT_VALUE) {
			clearStoredTimeZone();
			set({ timeZone: getDefaultTimeZone() });
			return;
		}
		if (!isValidTimeZoneId(timeZone)) return;
		writeStoredTimeZone(timeZone);
		set({ timeZone });
	},

	addSet: async (reps: number, options?: { dayKey?: string }) => {
		if (reps <= 0 || !Number.isFinite(reps)) return undefined;

		const { timeZone } = get();
		const targetDayKey = options?.dayKey ?? nowDayKey(timeZone);
		if (!canLogSetsForDay(targetDayKey, timeZone)) return undefined;

		const row: PushlogSet = {
			id: generateId(),
			exerciseTypeId: DEFAULT_EXERCISE_TYPE_ID,
			reps: Math.floor(reps),
			createdAt: new Date().toISOString(),
			dayKey: targetDayKey,
			version: SET_VERSION,
		};

		set((s) => ({ sets: [...s.sets, row], lastError: null }));

		try {
			await getStorageAdapter().putSet(row);
			return row.id;
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set((s) => ({
				lastError: message,
				sets: s.sets.filter((x) => x.id !== row.id),
			}));
			return undefined;
		}
	},

	removeSet: async (id: string) => {
		const prev = get().sets;
		const removed = prev.find((x) => x.id === id);
		if (!removed) return false;

		set({ sets: prev.filter((x) => x.id !== id), lastError: null });

		try {
			await getStorageAdapter().deleteSet(id);
			return true;
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ sets: prev, lastError: message });
			return false;
		}
	},

	restoreSet: async (row: PushlogSet) => {
		const prev = get().sets;
		const next = sortSetsByCreatedAtAsc([...prev, row]);
		set({ sets: next, lastError: null });
		try {
			await getStorageAdapter().putSet(row);
			return true;
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ sets: prev, lastError: message });
			return false;
		}
	},

	setDailyGoal: async (targetRepsPerDay: number) => {
		if (targetRepsPerDay <= 0 || !Number.isFinite(targetRepsPerDay)) return;
		const n = Math.floor(targetRepsPerDay);
		const now = new Date().toISOString();
		const goal: Goal = {
			id: generateId(),
			exerciseTypeId: DEFAULT_EXERCISE_TYPE_ID,
			targetRepsPerDay: n,
			effectiveFrom: now,
			updatedAt: now,
		};
		const prevGoal = get().goal;
		set({ goal, lastError: null });
		try {
			await getStorageAdapter().putGoal(goal);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ goal: prevGoal, lastError: message });
		}
	},

	clearDailyGoal: async () => {
		const prev = get().goal;
		set({ goal: null, lastError: null });
		try {
			await getStorageAdapter().clearGoal();
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ goal: prev, lastError: message });
		}
	},
}));
