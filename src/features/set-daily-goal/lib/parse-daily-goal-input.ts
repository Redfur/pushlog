export type ParsedDailyGoalInput = { kind: "empty" } | { kind: "valid"; reps: number } | { kind: "invalid" };

export function parseDailyGoalInput(raw: string): ParsedDailyGoalInput {
	const trimmed = raw.trim();
	if (trimmed === "") return { kind: "empty" };
	const n = Number.parseInt(trimmed, 10);
	if (!Number.isFinite(n) || n <= 0) return { kind: "invalid" };
	return { kind: "valid", reps: n };
}
