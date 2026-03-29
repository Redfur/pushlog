import { create } from "zustand";
import {
	EXERCISE_COLOR_PRESET_HEX,
	EXERCISE_TYPE_ROW_VERSION,
	isValidCustomExerciseColor,
	isValidExerciseColorPreset,
	isValidExerciseIconKey,
	resolvePresetColorValueToHex,
} from "@/shared/config/exercise-type-presets";
import { METRIKA_GOALS } from "@/shared/config/metrika-goals";
import { canLogSetsForDay, getDefaultTimeZone, nowDayKey } from "@/shared/lib/day-key";
import { generateId } from "@/shared/lib/id";
import { isValidSetWeightKg, roundWeightKg } from "@/shared/lib/parse-weight-input";
import { readStoredPreferredExerciseTypeRaw, writePreferredExerciseTypeId } from "@/shared/lib/preferred-exercise-type";
import { pushlogAnalytics } from "@/shared/lib/pushlog-analytics";
import { getStorageAdapter } from "@/shared/lib/storage";
import type { ExerciseIconDisplay, PersistedExerciseType } from "@/shared/lib/storage/schema";
import {
	clearStoredTimeZone,
	isValidTimeZoneId,
	readStoredTimeZone,
	TIMEZONE_AUTO_SELECT_VALUE,
	writeStoredTimeZone,
} from "@/shared/lib/timezone-preference";
import { sortSetsByCreatedAtAsc } from "./day-sets";
import type { Goal, PushlogSet } from "./types";

const SET_VERSION = 2;

function exerciseTypesToRecord(types: PersistedExerciseType[]): Record<string, PersistedExerciseType> {
	return Object.fromEntries(types.map((t) => [t.id, t]));
}

function firstActiveExerciseTypeId(byId: Record<string, PersistedExerciseType>): string {
	const active = Object.values(byId)
		.filter((t) => !t.archivedAt)
		.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	return active[0]?.id ?? "";
}

function resolvePreferredId(raw: string | null, byId: Record<string, PersistedExerciseType>): string {
	if (raw && byId[raw] && !byId[raw].archivedAt) return raw;
	return firstActiveExerciseTypeId(byId);
}

type NewExerciseTypeInput = {
	name: string;
	iconDisplay: ExerciseIconDisplay;
	iconKey: string;
	iconEmojiText: string;
	nameInitialGlyph: string;
	colorKind: "preset" | "custom";
	colorValue: string;
	trackWeightInSets: boolean;
};

type UpdateExerciseTypeInput = Partial<
	Pick<
		PersistedExerciseType,
		| "name"
		| "iconDisplay"
		| "iconKey"
		| "iconEmojiText"
		| "nameInitialGlyph"
		| "colorKind"
		| "colorValue"
		| "trackWeightInSets"
	>
>;

type PushlogState = {
	sets: PushlogSet[];
	goalsByExercise: Record<string, Goal>;
	exerciseTypesById: Record<string, PersistedExerciseType>;
	preferredExerciseTypeId: string;
	hydrated: boolean;
	lastError: string | null;
	timeZone: string;
	hydrate: () => Promise<void>;
	addSet: (
		reps: number,
		options?: { dayKey?: string; exerciseTypeId?: string; weightKg?: number | null },
	) => Promise<string | undefined>;
	removeSet: (id: string) => Promise<boolean>;
	restoreSet: (row: PushlogSet) => Promise<boolean>;
	setDailyGoal: (targetRepsPerDay: number, exerciseTypeId?: string) => Promise<void>;
	clearDailyGoal: (exerciseTypeId: string) => Promise<void>;
	setPreferredExerciseTypeId: (exerciseTypeId: string) => void;
	addExerciseType: (input: NewExerciseTypeInput) => Promise<string | undefined>;
	updateExerciseType: (id: string, patch: UpdateExerciseTypeInput) => Promise<boolean>;
	archiveExerciseType: (id: string) => Promise<boolean>;
	unarchiveExerciseType: (id: string) => Promise<boolean>;
	setTimeZone: (timeZone: string) => void;
	clearError: () => void;
};

function isActiveExerciseTypeId(get: () => PushlogState, id: string): boolean {
	const t = get().exerciseTypesById[id];
	return Boolean(t && !t.archivedAt);
}

function isRegisteredExerciseTypeId(get: () => PushlogState, id: string): boolean {
	return id in get().exerciseTypesById;
}

export const usePushlogStore = create<PushlogState>((set, get) => ({
	sets: [],
	goalsByExercise: {},
	exerciseTypesById: {},
	preferredExerciseTypeId: "",
	hydrated: false,
	lastError: null,
	timeZone: getDefaultTimeZone(),

	clearError: () => set({ lastError: null }),

	setPreferredExerciseTypeId: (exerciseTypeId: string) => {
		if (!isActiveExerciseTypeId(get, exerciseTypeId)) return;
		const prev = get().preferredExerciseTypeId;
		if (prev === exerciseTypeId) return;
		writePreferredExerciseTypeId(exerciseTypeId);
		set({ preferredExerciseTypeId: exerciseTypeId });
		const et = get().exerciseTypesById[exerciseTypeId];
		const exerciseName = et?.name?.trim();
		pushlogAnalytics.reachGoal(METRIKA_GOALS.exercisePreferredChange, {
			...(exerciseName ? { exercise_name: exerciseName } : {}),
		});
	},

	hydrate: async () => {
		const storage = getStorageAdapter();
		const tz = readStoredTimeZone() ?? getDefaultTimeZone();
		try {
			const [loadedSets, goalsRecord, typesList] = await Promise.all([
				storage.getAllSets(),
				storage.getGoals(),
				storage.getAllExerciseTypes(),
			]);
			const exerciseTypesById = exerciseTypesToRecord(typesList);
			const rawPreferred = readStoredPreferredExerciseTypeRaw();
			let preferred = resolvePreferredId(rawPreferred, exerciseTypesById);
			if (!preferred && typesList.length > 0) {
				preferred = typesList[0].id;
			}
			if (preferred) {
				writePreferredExerciseTypeId(preferred);
			}
			set({
				sets: loadedSets,
				goalsByExercise: goalsRecord,
				exerciseTypesById,
				preferredExerciseTypeId: preferred,
				hydrated: true,
				lastError: null,
				timeZone: tz,
			});
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({
				lastError: message,
				hydrated: true,
				timeZone: tz,
				preferredExerciseTypeId: "",
			});
		}
	},

	setTimeZone: (timeZone: string) => {
		if (timeZone === TIMEZONE_AUTO_SELECT_VALUE) {
			const hadExplicitTz = readStoredTimeZone() !== null;
			clearStoredTimeZone();
			set({ timeZone: getDefaultTimeZone() });
			if (hadExplicitTz) {
				pushlogAnalytics.reachGoal(METRIKA_GOALS.settingsTimezoneChange, { is_auto: 1 });
			}
			return;
		}
		if (!isValidTimeZoneId(timeZone)) return;
		if (readStoredTimeZone() === timeZone) return;
		writeStoredTimeZone(timeZone);
		set({ timeZone });
		pushlogAnalytics.reachGoal(METRIKA_GOALS.settingsTimezoneChange, {
			is_auto: 0,
			timezone: timeZone,
		});
	},

	addExerciseType: async (input: NewExerciseTypeInput) => {
		const name = input.name.trim();
		if (!name) return undefined;
		const iconDisplay: ExerciseIconDisplay = input.iconDisplay === "text" ? "text" : "lucide";
		const iconKey = isValidExerciseIconKey(input.iconKey) ? input.iconKey : "activity";
		let colorKind = input.colorKind;
		let colorValue = input.colorValue;
		if (colorKind === "custom") {
			if (!isValidCustomExerciseColor(colorValue)) {
				colorKind = "preset";
				colorValue = EXERCISE_COLOR_PRESET_HEX[0];
			}
		} else if (!isValidExerciseColorPreset(colorValue)) {
			colorValue = EXERCISE_COLOR_PRESET_HEX[0];
		} else {
			colorValue = resolvePresetColorValueToHex(colorValue);
		}
		const now = new Date().toISOString();
		const row: PersistedExerciseType = {
			id: crypto.randomUUID(),
			name,
			iconDisplay,
			iconKey,
			iconEmojiText: iconDisplay === "text" ? input.iconEmojiText : "",
			nameInitialGlyph: input.nameInitialGlyph,
			colorKind,
			colorValue,
			trackWeightInSets: input.trackWeightInSets,
			archivedAt: null,
			createdAt: now,
			updatedAt: now,
			version: EXERCISE_TYPE_ROW_VERSION,
		};
		set((s) => ({
			exerciseTypesById: { ...s.exerciseTypesById, [row.id]: row },
			lastError: null,
		}));
		try {
			await getStorageAdapter().putExerciseType(row);
			pushlogAnalytics.reachGoal(METRIKA_GOALS.exerciseCreate, { name: row.name });
			return row.id;
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set((s) => {
				const next = { ...s.exerciseTypesById };
				delete next[row.id];
				return { exerciseTypesById: next, lastError: message };
			});
			return undefined;
		}
	},

	updateExerciseType: async (id: string, patch: UpdateExerciseTypeInput) => {
		const prev = get().exerciseTypesById[id];
		if (!prev) return false;
		const now = new Date().toISOString();
		const iconDisplay: ExerciseIconDisplay = patch.iconDisplay !== undefined ? patch.iconDisplay : prev.iconDisplay;
		let iconKey = patch.iconKey !== undefined ? patch.iconKey : prev.iconKey;
		if (!isValidExerciseIconKey(iconKey)) iconKey = prev.iconKey;
		const iconEmojiText = patch.iconEmojiText !== undefined ? patch.iconEmojiText : prev.iconEmojiText;
		const nameInitialGlyph = patch.nameInitialGlyph !== undefined ? patch.nameInitialGlyph : prev.nameInitialGlyph;
		let colorKind = patch.colorKind !== undefined ? patch.colorKind : prev.colorKind;
		let colorValue = patch.colorValue !== undefined ? patch.colorValue : prev.colorValue;
		if (colorKind === "custom") {
			if (!isValidCustomExerciseColor(colorValue)) {
				colorKind = prev.colorKind;
				colorValue = prev.colorValue;
			}
		} else if (!isValidExerciseColorPreset(colorValue)) {
			colorValue = prev.colorValue;
		} else {
			colorValue = resolvePresetColorValueToHex(colorValue);
		}
		const row: PersistedExerciseType = {
			...prev,
			name: patch.name !== undefined ? patch.name.trim() || prev.name : prev.name,
			iconDisplay,
			iconKey,
			iconEmojiText: iconDisplay === "text" ? iconEmojiText : "",
			nameInitialGlyph,
			colorKind,
			colorValue,
			trackWeightInSets: patch.trackWeightInSets !== undefined ? patch.trackWeightInSets : prev.trackWeightInSets,
			updatedAt: now,
		};
		set((s) => ({ exerciseTypesById: { ...s.exerciseTypesById, [id]: row }, lastError: null }));
		try {
			await getStorageAdapter().putExerciseType(row);
			pushlogAnalytics.reachGoal(METRIKA_GOALS.exerciseEdit, { name: row.name });
			return true;
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ exerciseTypesById: { ...get().exerciseTypesById, [id]: prev }, lastError: message });
			return false;
		}
	},

	archiveExerciseType: async (id: string) => {
		const prev = get().exerciseTypesById[id];
		if (!prev || prev.archivedAt) return false;
		const now = new Date().toISOString();
		const row: PersistedExerciseType = { ...prev, archivedAt: now, updatedAt: now };
		set((s) => ({ exerciseTypesById: { ...s.exerciseTypesById, [id]: row }, lastError: null }));
		try {
			await getStorageAdapter().putExerciseType(row);
			pushlogAnalytics.reachGoal(METRIKA_GOALS.exerciseArchive, { name: prev.name });
			if (get().preferredExerciseTypeId === id) {
				const nextPref = firstActiveExerciseTypeId(get().exerciseTypesById);
				if (nextPref) {
					writePreferredExerciseTypeId(nextPref);
					set({ preferredExerciseTypeId: nextPref });
				} else {
					set({ preferredExerciseTypeId: "" });
				}
			}
			return true;
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ exerciseTypesById: { ...get().exerciseTypesById, [id]: prev }, lastError: message });
			return false;
		}
	},

	unarchiveExerciseType: async (id: string) => {
		const prev = get().exerciseTypesById[id];
		if (!prev || !prev.archivedAt) return false;
		const row: PersistedExerciseType = { ...prev, archivedAt: null, updatedAt: new Date().toISOString() };
		set((s) => ({ exerciseTypesById: { ...s.exerciseTypesById, [id]: row }, lastError: null }));
		try {
			await getStorageAdapter().putExerciseType(row);
			pushlogAnalytics.reachGoal(METRIKA_GOALS.exerciseUnarchive, { name: row.name });
			if (!get().preferredExerciseTypeId) {
				writePreferredExerciseTypeId(id);
				set({ preferredExerciseTypeId: id });
			}
			return true;
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ exerciseTypesById: { ...get().exerciseTypesById, [id]: prev }, lastError: message });
			return false;
		}
	},

	addSet: async (reps: number, options?: { dayKey?: string; exerciseTypeId?: string; weightKg?: number | null }) => {
		if (reps <= 0 || !Number.isFinite(reps)) return undefined;

		const { timeZone, preferredExerciseTypeId } = get();
		const exerciseTypeId = options?.exerciseTypeId ?? preferredExerciseTypeId;
		if (!isActiveExerciseTypeId(get, exerciseTypeId)) return undefined;

		const et = get().exerciseTypesById[exerciseTypeId];
		const trackWeight = Boolean(et?.trackWeightInSets);
		let weightValue: number | null | undefined;
		if (trackWeight) {
			const w = options?.weightKg;
			if (w == null || !Number.isFinite(w) || !isValidSetWeightKg(w)) return undefined;
			weightValue = roundWeightKg(w);
		}

		const targetDayKey = options?.dayKey ?? nowDayKey(timeZone);
		if (!canLogSetsForDay(targetDayKey, timeZone)) return undefined;

		const row: PushlogSet = {
			id: generateId(),
			exerciseTypeId,
			reps: Math.floor(reps),
			...(weightValue != null ? { weightValue } : {}),
			createdAt: new Date().toISOString(),
			dayKey: targetDayKey,
			version: SET_VERSION,
		};

		set((s) => ({ sets: [...s.sets, row], lastError: null }));

		try {
			await getStorageAdapter().putSet(row);
			const et = get().exerciseTypesById[exerciseTypeId];
			const exerciseName = et?.name?.trim();
			pushlogAnalytics.reachGoal(METRIKA_GOALS.exerciseSetLogged, {
				reps: row.reps,
				...(exerciseName ? { exercise_name: exerciseName } : {}),
			});
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
			const et = get().exerciseTypesById[removed.exerciseTypeId];
			const exerciseName = et?.name?.trim();
			pushlogAnalytics.reachGoal(METRIKA_GOALS.exerciseRemove, {
				reps: removed.reps,
				...(exerciseName ? { exercise_name: exerciseName } : {}),
			});
			return true;
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ sets: prev, lastError: message });
			return false;
		}
	},

	restoreSet: async (row: PushlogSet) => {
		if (!isRegisteredExerciseTypeId(get, row.exerciseTypeId)) return false;
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

	setDailyGoal: async (targetRepsPerDay: number, exerciseTypeIdArg?: string) => {
		if (targetRepsPerDay <= 0 || !Number.isFinite(targetRepsPerDay)) return;
		const exerciseTypeId = exerciseTypeIdArg ?? get().preferredExerciseTypeId;
		if (!isActiveExerciseTypeId(get, exerciseTypeId)) return;

		const n = Math.floor(targetRepsPerDay);
		const now = new Date().toISOString();
		const goal: Goal = {
			id: generateId(),
			exerciseTypeId,
			targetRepsPerDay: n,
			effectiveFrom: now,
			updatedAt: now,
		};
		const prevGoals = get().goalsByExercise;
		const prevOne = prevGoals[exerciseTypeId];
		const nextGoals = { ...prevGoals, [exerciseTypeId]: goal };
		set({ goalsByExercise: nextGoals, lastError: null });
		try {
			await getStorageAdapter().putGoalForExercise(goal);
			pushlogAnalytics.reachGoal(METRIKA_GOALS.exerciseGoalSet, { target_reps_per_day: n });
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			const rolled: Record<string, Goal> = { ...prevGoals };
			if (prevOne) {
				rolled[exerciseTypeId] = prevOne;
			} else {
				delete rolled[exerciseTypeId];
			}
			set({ goalsByExercise: rolled, lastError: message });
		}
	},

	clearDailyGoal: async (exerciseTypeId: string) => {
		const prevGoals = get().goalsByExercise;
		if (!(exerciseTypeId in prevGoals)) return;
		const nextGoals = { ...prevGoals };
		delete nextGoals[exerciseTypeId];
		set({ goalsByExercise: nextGoals, lastError: null });
		try {
			await getStorageAdapter().clearGoalForExercise(exerciseTypeId);
			pushlogAnalytics.reachGoal(METRIKA_GOALS.exerciseGoalClear);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			set({ goalsByExercise: prevGoals, lastError: message });
		}
	},
}));
