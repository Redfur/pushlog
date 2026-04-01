import { injectTranslation } from "@/shared/lib/i18n";
import { STATS_NS, statsTranslations } from "./translations";

injectTranslation(STATS_NS, statsTranslations as Record<string, Record<string, string>>);

export { StatsLoadingSkeleton } from "./ui/StatsLoadingSkeleton";
export { StatsScreen } from "./ui/StatsScreen";
