import { injectTranslation } from "@/shared/lib/i18n";
import { MANAGE_EXERCISES_NS, manageExercisesTranslations } from "./translations";

injectTranslation(MANAGE_EXERCISES_NS, manageExercisesTranslations as Record<string, Record<string, string>>);

export { MANAGE_EXERCISES_NS } from "./translations";
export { ManageExercisesScreen } from "./ui/ManageExercisesScreen";
