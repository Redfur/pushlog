import { injectTranslation } from "@/shared/lib/i18n";
import { REMOVE_SET_NS, removeSetTranslations } from "./translations";

injectTranslation(REMOVE_SET_NS, removeSetTranslations as Record<string, Record<string, string>>);

export { useRemoveSet } from "./model/use-remove-set";
export { REMOVE_SET_NS } from "./translations";
