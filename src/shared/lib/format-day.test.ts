import { describe, expect, test } from "vitest";
import { bcp47FromI18nLang, formatDayKeyFriendly, formatDayKeyFull } from "./format-day";

describe("format-day", () => {
	test("maps i18n lang to bcp47", () => {
		expect(bcp47FromI18nLang("ru")).toBe("ru-RU");
		expect(bcp47FromI18nLang("en-US")).toBe("en-US");
		expect(bcp47FromI18nLang(undefined)).toBeUndefined();
	});

	test("formats full and friendly labels", () => {
		const full = formatDayKeyFull("2026-01-05", "en-US");
		const friendly = formatDayKeyFriendly("2026-01-05", "en-US");

		expect(full).toContain("2026");
		expect(full.length).toBeGreaterThan(friendly.length);
		expect(friendly).toContain("January");
	});
});
