import { describe, expect, test } from "vitest";
import { buildMetaRow, goalsFromMeta } from "./meta-goals";

describe("meta-goals", () => {
	test("returns empty goals when meta has no goals map", () => {
		expect(goalsFromMeta({ key: "app", schemaVersion: 1 })).toEqual({});
	});

	test("builds meta row without goals for empty map", () => {
		expect(buildMetaRow({ key: "app", schemaVersion: 2 }, {})).toEqual({
			key: "app",
			schemaVersion: 2,
		});
	});

	test("builds meta row with goals for non-empty map", () => {
		const goals = { et1: { id: "g1", exerciseTypeId: "et1", targetRepsPerDay: 30 } };
		const meta = buildMetaRow({ key: "app", schemaVersion: 1 }, goals as never);
		expect(meta.goalsByExerciseTypeId).toEqual(goals);
	});
});
