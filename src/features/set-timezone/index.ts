import { injectTranslation } from "@/shared/lib/i18n";
import { SET_TIMEZONE_NS, setTimezoneTranslations } from "./translations";

injectTranslation(SET_TIMEZONE_NS, setTimezoneTranslations as Record<string, Record<string, string>>);

export { TimezoneSelect } from "./ui/TimezoneSelect";
