import "@/features/set-daily-goal";
import "@/features/set-timezone";
import { injectTranslation } from "@/shared/lib/i18n";
import { STATS_NS, statsTranslations } from "./translations";

injectTranslation(STATS_NS, statsTranslations as Record<string, Record<string, string>>);

export { StatsScreen } from "./ui/StatsScreen";
export { STATS_NS, statsTranslations };
