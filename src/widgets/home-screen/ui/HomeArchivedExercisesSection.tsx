import { useMemo } from "react";
import { usePushlogStore } from "@/entities/pushup";
import { ArchivedExerciseCollapsible } from "./ArchivedExerciseCollapsible";

export function HomeArchivedExercisesSection() {
	const exerciseTypesById = usePushlogStore((s) => s.exerciseTypesById);
	const unarchiveExerciseType = usePushlogStore((s) => s.unarchiveExerciseType);

	const archivedSorted = useMemo(() => {
		return Object.values(exerciseTypesById)
			.filter((x) => Boolean(x.archivedAt))
			.sort((a, b) => a.name.localeCompare(b.name, "ru"));
	}, [exerciseTypesById]);

	if (archivedSorted.length === 0) {
		return null;
	}

	return <ArchivedExerciseCollapsible archivedSorted={archivedSorted} unarchiveExerciseType={unarchiveExerciseType} />;
}
