import { injectTranslation } from "@/shared/lib/i18n";
import { SET_DAILY_GOAL_NS, setDailyGoalTranslations } from "./translations";

injectTranslation(SET_DAILY_GOAL_NS, setDailyGoalTranslations as Record<string, Record<string, string>>);

export { ExerciseGoalFields } from "./ui/ExerciseGoalFields";
export { GoalSettingsCard } from "./ui/GoalSettingsCard";
export { SET_DAILY_GOAL_NS, setDailyGoalTranslations };
