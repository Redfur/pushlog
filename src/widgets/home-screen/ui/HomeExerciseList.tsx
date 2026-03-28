import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePushlogStore } from "@/entities/pushup";
import { ExerciseTypeIcon } from "@/features/select-exercise";
import { pickExerciseTypeIconVisual, resolveExerciseTypeColor } from "@/shared/config/exercise-type-presets";
import { HOME_SCREEN_NS } from "../translations";

export function HomeExerciseList() {
	const { t } = useTranslation(HOME_SCREEN_NS);
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);

	const activeSorted = useMemo(() => {
		return Object.values(exerciseTypesById)
			.filter((x) => !x.archivedAt)
			.sort((a, b) => a.name.localeCompare(b.name, "ru"));
	}, [exerciseTypesById]);

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
	);
}
