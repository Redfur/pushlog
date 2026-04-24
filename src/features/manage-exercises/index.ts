import { injectTranslation } from "@/shared/lib/i18n";
import { MANAGE_EXERCISES_NS, manageExercisesTranslations } from "./translations";

injectTranslation(MANAGE_EXERCISES_NS, manageExercisesTranslations as Record<string, Record<string, string>>);

export { MANAGE_EXERCISES_NS } from "./translations";
export { ExerciseDeleteDialog } from "./ui/ExerciseDeleteDialog";
export { ExerciseTypeEditorFields } from "./ui/ExerciseTypeEditorFields";
export {
	defaultExerciseTypeDraft,
	type ExerciseTypeDraft,
	exerciseTypeDraftFromPersisted,
	normalizeExerciseTypeDraft,
} from "./ui/exercise-type-draft";
