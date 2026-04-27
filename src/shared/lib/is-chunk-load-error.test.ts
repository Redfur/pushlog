import { describe, expect, test } from "vitest";
import { isChunkLoadError } from "./is-chunk-load-error";

describe("isChunkLoadError", () => {
	test("detects known chunk-load signatures", () => {
		expect(isChunkLoadError(new Error("Failed to fetch dynamically imported module"))).toBe(true);
		expect(isChunkLoadError(new Error("Loading chunk 42 failed"))).toBe(true);
		expect(isChunkLoadError(new Error("Importing a module script failed."))).toBe(true);
	});

	test("detects ChunkLoadError by name", () => {
		const err = new Error("anything");
		err.name = "ChunkLoadError";
		expect(isChunkLoadError(err)).toBe(true);
	});

	test("returns false for non-errors and unrelated errors", () => {
		expect(isChunkLoadError("oops")).toBe(false);
		expect(isChunkLoadError(new Error("network timeout"))).toBe(false);
	});
});
