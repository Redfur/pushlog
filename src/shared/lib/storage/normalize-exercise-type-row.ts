import { firstGrapheme } from "@/shared/lib/first-grapheme";
import type { ExerciseIconDisplay, PersistedExerciseType } from "./schema";

/** Частичная запись из IDB — поля иконки дополняются при чтении. */
export type PersistedExerciseTypeLoose = Omit<
	PersistedExerciseType,
	"iconDisplay" | "iconEmojiText" | "nameInitialGlyph"
> &
	Partial<Pick<PersistedExerciseType, "iconDisplay" | "iconEmojiText" | "nameInitialGlyph">>;

export function normalizeExerciseTypeRow(row: PersistedExerciseTypeLoose): PersistedExerciseType {
	const iconDisplay: ExerciseIconDisplay = row.iconDisplay === "text" ? "text" : "lucide";
	const iconEmojiText = row.iconEmojiText ?? "";
	const nameFirst = firstGrapheme(row.name);
	let nameInitialGlyph = row.nameInitialGlyph ?? "";
	if (iconDisplay === "text") {
		if (!iconEmojiText.trim()) {
			nameInitialGlyph = nameFirst;
		} else if (!nameInitialGlyph) {
			nameInitialGlyph = nameFirst;
		}
	} else {
		nameInitialGlyph = nameFirst;
	}
	return {
		...row,
		iconDisplay,
		iconEmojiText,
		nameInitialGlyph,
	};
}
