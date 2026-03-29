import { YANDEX_METRIKA_CONFIG } from "@/shared/config/metrika";
import type { MetrikaGoalId } from "@/shared/config/metrika-goals";
import { readAnalyticsGoalsEnabled } from "@/shared/lib/analytics-goals-preference";

const MAX_STRING_PARAM_LEN = 100;

type MetrikaGoalParams = Record<string, string | number>;

interface PushlogAnalytics {
	reachGoal(goalId: MetrikaGoalId, params?: MetrikaGoalParams): void;
}

function truncateParamString(s: string): string {
	const t = s.trim();
	if (t.length <= MAX_STRING_PARAM_LEN) return t;
	return t.slice(0, MAX_STRING_PARAM_LEN);
}

function sanitizeParams(params: MetrikaGoalParams | undefined): MetrikaGoalParams | undefined {
	if (!params || Object.keys(params).length === 0) return undefined;
	const out: MetrikaGoalParams = {};
	for (const [k, v] of Object.entries(params)) {
		if (typeof v === "string") {
			out[k] = truncateParamString(v);
		} else if (typeof v === "number" && Number.isFinite(v)) {
			out[k] = v;
		}
	}
	return Object.keys(out).length > 0 ? out : undefined;
}

type YandexMetrikaFn = (
	counterId: string | number,
	method: "reachGoal",
	target: string,
	params?: Record<string, unknown>,
) => void;

function getYm(): YandexMetrikaFn | undefined {
	if (typeof window === "undefined") return undefined;
	const ym = (window as unknown as { ym?: unknown }).ym;
	return typeof ym === "function" ? (ym as YandexMetrikaFn) : undefined;
}

class YandexMetrikaAnalytics implements PushlogAnalytics {
	reachGoal(goalId: MetrikaGoalId, params?: MetrikaGoalParams): void {
		if (!import.meta.env.PROD) return;
		const counterId = YANDEX_METRIKA_CONFIG.METRIKA_ID;
		if (!counterId) return;
		if (!readAnalyticsGoalsEnabled()) return;
		const ym = getYm();
		if (!ym) return;
		const safe = sanitizeParams(params);
		const id = /^\d+$/.test(counterId) ? Number(counterId) : counterId;
		if (safe) {
			ym(id, "reachGoal", goalId, safe);
		} else {
			ym(id, "reachGoal", goalId);
		}
	}
}

export const pushlogAnalytics: PushlogAnalytics = new YandexMetrikaAnalytics();
