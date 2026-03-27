import { QUICK_ADD_PRESETS } from "@/shared/config/pushlog";
import { CLIENT_STORAGE_KEYS } from "@/shared/lib/client-storage-keys";

const STORAGE_KEY = CLIENT_STORAGE_KEYS.quickAddPresets;

const DEFAULT_SET = new Set<number>(QUICK_ADD_PRESETS);

const MAX_REPS = 9999;

/** Максимум пользовательских быстрых кнопок (не считая дефолтные 10/20). */
export const MAX_CUSTOM_QUICK_ADD_PRESETS = 2;

function parseReps(x: unknown): number | null {
	const n = typeof x === "number" ? x : Number.parseInt(String(x), 10);
	if (!Number.isFinite(n) || n < 1 || n > MAX_REPS) return null;
	return Math.floor(n);
}

/** Порядок в массиве — порядок добавления (старые в начале); без сортировки по значению. */
function normalizeOrderedList(values: unknown[]): number[] {
	const seen = new Set<number>();
	const out: number[] = [];
	for (const x of values) {
		const r = parseReps(x);
		if (r === null || DEFAULT_SET.has(r) || seen.has(r)) continue;
		seen.add(r);
		out.push(r);
	}
	return out.slice(-MAX_CUSTOM_QUICK_ADD_PRESETS);
}

export function readCustomQuickAddPresets(): number[] {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];
		return normalizeOrderedList(parsed);
	} catch {
		return [];
	}
}

export function writeCustomQuickAddPresets(values: number[]): void {
	if (typeof localStorage === "undefined") return;
	const cleaned = normalizeOrderedList(values);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
}

/** Добавить в список быстрых кнопок; при переполнении вытесняется самое раннее добавленное. */
export function rememberCustomQuickAddPreset(reps: number): void {
	if (!Number.isFinite(reps) || reps < 1 || reps > MAX_REPS) return;
	const r = Math.floor(reps);
	if (DEFAULT_SET.has(r)) return;
	const current = readCustomQuickAddPresets();
	if (current.includes(r)) return;
	const next = [...current, r];
	writeCustomQuickAddPresets(next.slice(-MAX_CUSTOM_QUICK_ADD_PRESETS));
}

export function removeCustomQuickAddPreset(reps: number): void {
	const current = readCustomQuickAddPresets().filter((x) => x !== reps);
	writeCustomQuickAddPresets(current);
}
