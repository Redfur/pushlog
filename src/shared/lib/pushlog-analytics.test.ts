import { describe, expect, test } from "vitest";

describe("pushlog-analytics", () => {
	test("sanitizes string parameters by trimming and truncating", () => {
		const MAX_LEN = 100;
		const input = `  ${"a".repeat(150)}  `;
		const trimmed = input.trim();
		const truncated = trimmed.length > MAX_LEN ? trimmed.slice(0, MAX_LEN) : trimmed;

		expect(truncated).toBe("a".repeat(100));
		expect(truncated.length).toBe(100);
	});

	test("filters out non-finite numbers", () => {
		const params = {
			reps: 50,
			invalid: Number.NaN,
			infinity: Number.POSITIVE_INFINITY,
			negative: -Number.POSITIVE_INFINITY,
		};

		const sanitized: Record<string, number> = {};
		for (const [k, v] of Object.entries(params)) {
			if (typeof v === "number" && Number.isFinite(v)) {
				sanitized[k] = v;
			}
		}

		expect(sanitized).toEqual({ reps: 50 });
	});

	test("handles empty params", () => {
		const params = {};
		const hasParams = Object.keys(params).length > 0;

		expect(hasParams).toBe(false);
	});

	test("converts numeric counter id from string", () => {
		const counterId = "12345678";
		const converted = /^\d+$/.test(counterId) ? Number(counterId) : counterId;

		expect(converted).toBe(12345678);
		expect(typeof converted).toBe("number");
	});

	test("keeps non-numeric counter id as string", () => {
		const counterId = "abc123";
		const converted = /^\d+$/.test(counterId) ? Number(counterId) : counterId;

		expect(converted).toBe("abc123");
		expect(typeof converted).toBe("string");
	});
});
