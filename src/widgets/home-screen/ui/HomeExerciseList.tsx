import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePushlogStore } from "@/entities/pushup";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import { pickExerciseTypeIconVisual, resolveExerciseTypeColor } from "@/shared/config/exercise-type-presets";
import type { PersistedExerciseType } from "@/shared/lib/storage/schema";
import { cn } from "@/shared/lib/utils";
import { HOME_SCREEN_NS } from "../translations";

export function HomeExerciseList() {
	const { t } = useTranslation(HOME_SCREEN_NS);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const unarchiveExerciseType = usePushlogStore((s) => s.unarchiveExerciseType);

	const { activeSorted, archivedSorted } = useMemo(() => {
		const all = Object.values(exerciseTypesById);
		const active = all.filter((x) => !x.archivedAt).sort((a, b) => a.name.localeCompare(b.name, "ru"));
		const archived = all.filter((x) => Boolean(x.archivedAt)).sort((a, b) => a.name.localeCompare(b.name, "ru"));
		return { activeSorted: active, archivedSorted: archived };
	}, [exerciseTypesById]);

	const showArchiveBlock = archivedSorted.length > 0;

	if (activeSorted.length === 0) {
		return (
			<div className="flex flex-col gap-3">
				<Button type="button" asChild>
					<Link to="/exercises/new">{t("addExercise")}</Link>
				</Button>
				{showArchiveBlock ? (
					<ArchivedExerciseCollapsible archivedSorted={archivedSorted} unarchiveExerciseType={unarchiveExerciseType} />
				) : null}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<ul className="flex flex-col gap-2">
				{activeSorted.map((et) => {
					const accent = resolveExerciseTypeColor(et);
					return (
						<li key={et.id}>
							<Link
								to={`/exercises/${et.id}`}
								className="bg-card hover:bg-accent/50 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors"
							>
								<ExerciseTypeIcon
									exerciseType={pickExerciseTypeIconVisual(et)}
									className="size-5 shrink-0"
									style={{ color: accent }}
									aria-hidden
								/>
								<span className="min-w-0 flex-1 truncate font-medium">{et.name}</span>
								<ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
							</Link>
						</li>
					);
				})}
			</ul>
			{showArchiveBlock ? (
				<ArchivedExerciseCollapsible archivedSorted={archivedSorted} unarchiveExerciseType={unarchiveExerciseType} />
			) : null}
		</div>
	);
}

function ArchivedExerciseCollapsible({
	archivedSorted,
	unarchiveExerciseType,
}: {
	archivedSorted: PersistedExerciseType[];
	unarchiveExerciseType: (id: string) => Promise<boolean>;
}) {
	const { t } = useTranslation(HOME_SCREEN_NS);

	return (
		<Collapsible defaultOpen={false} className="group/collapsible">
			<CollapsibleTrigger
				type="button"
				className={cn(
					"bg-muted/40 hover:bg-muted/60 flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
					"outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				)}
			>
				<ChevronDown
					className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
					aria-hidden
				/>
				<span className="min-w-0 flex-1">
					{t("archivedSection")}
					<span className="text-muted-foreground ml-1.5 font-normal tabular-nums">
						({t("archivedCount", { count: archivedSorted.length })})
					</span>
				</span>
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-2">
				<ul className="flex flex-col gap-2">
					{archivedSorted.map((et) => {
						const accent = resolveExerciseTypeColor(et);
						return (
							<li
								key={et.id}
								className="bg-card flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2.5 text-sm sm:flex-nowrap"
							>
								<ExerciseTypeIcon
									exerciseType={pickExerciseTypeIconVisual(et)}
									className="size-5 shrink-0"
									style={{ color: accent }}
									aria-hidden
								/>
								<Link
									to={`/exercises/${et.id}`}
									className="text-muted-foreground min-w-0 flex-1 truncate font-medium line-through decoration-muted-foreground/60"
								>
									{et.name}
								</Link>
								<Button
									type="button"
									variant="secondary"
									size="sm"
									className="shrink-0"
									onClick={() => void unarchiveExerciseType(et.id)}
								>
									{t("unarchiveExercise")}
								</Button>
							</li>
						);
					})}
				</ul>
			</CollapsibleContent>
		</Collapsible>
	);
}
