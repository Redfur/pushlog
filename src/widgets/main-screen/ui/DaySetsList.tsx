import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { PushlogSet } from "@/entities/pushup";
import { sortSetsByCreatedAtAsc, usePushlogStore } from "@/entities/pushup";
import { REMOVE_SET_NS, useRemoveSet } from "@/features/remove-set";
import { ExerciseTypeIcon, SELECT_EXERCISE_NS } from "@/features/select-exercise";
import {
	lucideIconVisual,
	pickExerciseTypeIconVisual,
	resolveExerciseTypeColor,
} from "@/shared/config/exercise-type-presets";
import { bcp47FromI18nLang } from "@/shared/lib/format-day";
import { MAIN_SCREEN_NS } from "../translations";

function formatTime(iso: string, locale: string | undefined): string {
	try {
		return new Intl.DateTimeFormat(locale, {
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

type Props = {
	sets: PushlogSet[];
};

export function DaySetsList({ sets }: Props) {
	const { t, i18n } = useTranslation(MAIN_SCREEN_NS);
	const { t: tEx } = useTranslation(SELECT_EXERCISE_NS);
	const locale = bcp47FromI18nLang(i18n.language);
	const { t: tRm } = useTranslation(REMOVE_SET_NS);
	const remove = useRemoveSet();
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const ordered = sortSetsByCreatedAtAsc(sets);

	if (ordered.length === 0) {
		return <p className="text-muted-foreground text-sm">{t("empty")}</p>;
	}

	return (
		<ul className="flex flex-col gap-2">
			{ordered.map((row) => {
				const et = exerciseTypesById[row.exerciseTypeId];
				const typeLabel = et?.name ?? tEx("unknownType");
				const iconVisual = et ? pickExerciseTypeIconVisual(et) : lucideIconVisual("activity");
				const color = et ? resolveExerciseTypeColor(et) : undefined;

				return (
					<li
						key={row.id}
						className="bg-card text-card-foreground flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
					>
						<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
							<ExerciseTypeIcon exerciseType={iconVisual} style={color ? { color } : undefined} aria-hidden />
							<span className="text-muted-foreground min-w-0 truncate text-sm">{typeLabel}</span>
							<span className="text-lg font-semibold tabular-nums">{row.reps}</span>
							<span className="text-muted-foreground text-sm">{formatTime(row.createdAt, locale)}</span>
						</div>
						<Button
							type="button"
							size="icon"
							variant="ghost"
							className="shrink-0"
							aria-label={tRm("removeAria")}
							onClick={() => remove(row.id)}
						>
							<Trash2 className="size-4" />
						</Button>
					</li>
				);
			})}
		</ul>
	);
}
