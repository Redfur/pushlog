import { describe, expect, test, vi } from "vitest";
import { isValidTimeZoneId } from "./timezone-preference";

describe("timezone-preference", () => {
	test("validates timezone ids", () => {
		vi.stubGlobal("Intl", {
			supportedValuesOf: (type: string) => {
				if (type === "timeZone") {
					return ["Europe/London", "America/New_York", "Asia/Tokyo"];
				}
				return [];
			},
		});

		expect(isValidTimeZoneId("Europe/London")).toBe(true);
		expect(isValidTimeZoneId("America/New_York")).toBe(true);
		expect(isValidTimeZoneId("Bad/Timezone")).toBe(false);
		expect(isValidTimeZoneId("")).toBe(false);

		vi.unstubAllGlobals();
	});
});
