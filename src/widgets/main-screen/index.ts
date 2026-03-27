import { injectTranslation } from "@/shared/lib/i18n";
import { MAIN_SCREEN_NS, mainScreenTranslations } from "./translations";

injectTranslation(MAIN_SCREEN_NS, mainScreenTranslations as Record<string, Record<string, string>>);

export { MainScreen } from "./ui/MainScreen";
export { MAIN_SCREEN_NS, mainScreenTranslations };
