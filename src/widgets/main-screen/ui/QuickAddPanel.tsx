import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ADD_SET_NS, useAddSet } from "@/features/add-set";
import { QUICK_ADD_PRESETS } from "@/shared/config/pushlog";
import { MAIN_SCREEN_NS } from "../translations";

export function QuickAddPanel() {
	const { t } = useTranslation(MAIN_SCREEN_NS);
	const { t: tAdd } = useTranslation(ADD_SET_NS);
	const { addPresetReps, repeatLast } = useAddSet();

	return (
		<div className="flex flex-col gap-3">
			<p className="text-muted-foreground text-sm">{t("quickAdd")}</p>
			<div className="flex flex-wrap gap-2">
				{QUICK_ADD_PRESETS.map((n) => (
					<Button key={n} type="button" size="lg" variant="default" onClick={() => void addPresetReps(n)}>
						+{n}
					</Button>
				))}
				<Button type="button" size="lg" variant="secondary" onClick={() => repeatLast()}>
					{tAdd("repeatLast")}
				</Button>
			</div>
		</div>
	);
}
