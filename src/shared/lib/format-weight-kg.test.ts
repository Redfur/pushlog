import { describe, expect, test } from "vitest";
import { formatTonnageMassDisplay, formatTonnageWithKgUnit, formatWeightKgDisplay } from "./format-weight-kg";

describe("format-weight-kg", () => {
	test("formats weight with locale decimals", () => {
		expect(formatWeightKgDisplay(12.5, "en-US")).toBe("12.5");
		expect(formatWeightKgDisplay(12.5, "ru-RU")).toBe("12,5");
	});

	test("formats tonnage in kg below threshold and in tonnes above", () => {
		expect(formatTonnageMassDisplay(999.4, "en-US")).toBe("999.4\u00A0кг");
		expect(formatTonnageMassDisplay(1250, "en-US")).toBe("1.25\u00A0t");
		expect(formatTonnageMassDisplay(1250, "ru-RU")).toBe("1,25\u00A0т");
	});

	test("returns zero kg for non-finite values", () => {
		expect(formatTonnageWithKgUnit(Number.NaN, "en-US")).toBe("0\u00A0кг");
		expect(formatTonnageWithKgUnit(-10, "en-US")).toBe("0\u00A0кг");
	});
});
