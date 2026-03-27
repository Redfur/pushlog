import { injectTranslation } from "@/shared/lib/i18n";
import { ADD_SET_NS, addSetTranslations } from "./translations";

injectTranslation(ADD_SET_NS, addSetTranslations as Record<string, Record<string, string>>);

export { useAddSet } from "./model/use-add-set";
export { ADD_SET_NS, addSetTranslations };
