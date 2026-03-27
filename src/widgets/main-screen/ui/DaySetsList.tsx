import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { PushlogSet } from "@/entities/pushup";
import { sortSetsByCreatedAtAsc } from "@/entities/pushup";
import { REMOVE_SET_NS, useRemoveSet } from "@/features/remove-set";
import { MAIN_SCREEN_NS } from "../translations";

function formatTime(iso: string): string {
	try {
		return new Intl.DateTimeFormat(undefined, {
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
	const { t } = useTranslation(MAIN_SCREEN_NS);
	const { t: tRm } = useTranslation(REMOVE_SET_NS);
	const remove = useRemoveSet();
	const ordered = sortSetsByCreatedAtAsc(sets);

	if (ordered.length === 0) {
		return <p className="text-muted-foreground text-sm">{t("empty")}</p>;
	}

	return (
		<ul className="flex flex-col gap-2">
			{ordered.map((row) => (
				<li
					key={row.id}
					className="bg-card text-card-foreground flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
				>
					<div className="flex min-w-0 flex-1 items-baseline gap-2">
						<span className="text-lg font-semibold tabular-nums">{row.reps}</span>
						<span className="text-muted-foreground text-sm">{formatTime(row.createdAt)}</span>
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
			))}
		</ul>
	);
}
