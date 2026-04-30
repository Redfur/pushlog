import { describe, expect, test } from "vitest";
import { formatTonnageWithKgUnit } from "./format-weight-kg";

describe("format-weight-kg", () => {
	test("returns zero kg for non-finite values", () => {
		expect(formatTonnageWithKgUnit(Number.NaN, "en-US")).toBe("0\u00A0кг");
		expect(formatTonnageWithKgUnit(-10, "en-US")).toBe("0\u00A0кг");
		expect(formatTonnageWithKgUnit(Number.POSITIVE_INFINITY, "en-US")).toBe("0\u00A0кг");
	});
});
