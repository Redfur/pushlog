import { injectTranslation } from "@/shared/lib/i18n";
import { SELECT_EXERCISE_NS, selectExerciseTranslations } from "./translations";

injectTranslation(SELECT_EXERCISE_NS, selectExerciseTranslations as Record<string, Record<string, string>>);

export { SELECT_EXERCISE_NS } from "./translations";
export { ExerciseTypeIcon } from "./ui/ExerciseTypeIcon";
