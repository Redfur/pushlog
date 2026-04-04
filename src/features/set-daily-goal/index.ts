import { injectTranslation } from "@/shared/lib/i18n";
import { SET_DAILY_GOAL_NS, setDailyGoalTranslations } from "./translations";

injectTranslation(SET_DAILY_GOAL_NS, setDailyGoalTranslations as Record<string, Record<string, string>>);

export { parseDailyGoalInput } from "./lib/parse-daily-goal-input";
export { SET_DAILY_GOAL_NS } from "./translations";
export { ExerciseDailyGoalEditor } from "./ui/ExerciseDailyGoalEditor";
