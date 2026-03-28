import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { filterSetsByDayKey, usePushlogStore } from "@/entities/pushup";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import { resolveExerciseTypeColor } from "@/shared/config/exercise-type-presets";
import { cn } from "@/shared/lib/utils";
import { HOME_SCREEN_NS } from "../translations";

type Props = {
	todayKey: string;
};

export function HomeExerciseList({ todayKey }: Props) {
	const { t } = useTranslation(HOME_SCREEN_NS);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const preferredExerciseTypeId = usePushlogStore((s) => s.preferredExerciseTypeId);
	const setPreferredExerciseTypeId = usePushlogStore((s) => s.setPreferredExerciseTypeId);
	const sets = usePushlogStore((s) => s.sets);

	const daySets = useMemo(() => filterSetsByDayKey(sets, todayKey), [sets, todayKey]);

	const activeSorted = useMemo(() => {
		return Object.values(exerciseTypesById)
			.filter((x) => !x.archivedAt)
			.sort((a, b) => a.name.localeCompare(b.name, "ru"));
	}, [exerciseTypesById]);

	const repsSetsByTypeId = useMemo(() => {
		const map = new Map<string, { reps: number; sets: number }>();
		for (const s of daySets) {
			const cur = map.get(s.exerciseTypeId) ?? { reps: 0, sets: 0 };
			cur.reps += s.reps;
			cur.sets += 1;
			map.set(s.exerciseTypeId, cur);
		}
		return map;
	}, [daySets]);

	if (activeSorted.length === 0) {
		return (
			<div className="flex flex-col gap-2">
				<Button type="button" asChild>
					<Link to="/exercises/new">{t("addExercise")}</Link>
				</Button>
			</div>
		);
	}

	return (
		<ul className="flex flex-col gap-2">
			{activeSorted.map((et) => {
				const agg = repsSetsByTypeId.get(et.id) ?? { reps: 0, sets: 0 };
				const accent = resolveExerciseTypeColor(et);
				const isPreferred = preferredExerciseTypeId === et.id;
				return (
					<li key={et.id}>
						<div
							className={cn(
								"bg-card flex items-center gap-3 rounded-lg border px-3 py-2.5",
								isPreferred && "ring-2 ring-ring/40",
							)}
						>
							<button
								type="button"
								className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"
								onClick={() => setPreferredExerciseTypeId(et.id)}
							>
								<ExerciseTypeIcon
									iconKey={et.iconKey}
									className="size-5 shrink-0"
									style={{ color: accent }}
									aria-hidden
								/>
								<span className="min-w-0 flex-1 truncate font-medium">{et.name}</span>
								<span className="text-muted-foreground shrink-0 tabular-nums">
									{t("repsSetsLine", { reps: agg.reps, sets: agg.sets })}
								</span>
							</button>
							<Button type="button" variant="ghost" size="icon-sm" asChild>
								<Link to={`/exercises/${et.id}`} aria-label={et.name}>
									<ChevronRight className="size-4" />
								</Link>
							</Button>
						</div>
					</li>
				);
			})}
		</ul>
	);
}
