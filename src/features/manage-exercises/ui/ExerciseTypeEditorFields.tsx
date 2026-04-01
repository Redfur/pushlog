import { ExerciseTypeColorFields } from "./ExerciseTypeColorFields";
import { ExerciseTypeIconAndPreviewFields } from "./ExerciseTypeIconAndPreviewFields";
import type { ExerciseTypeDraft } from "./exercise-type-draft";

type Props = {
	draft: ExerciseTypeDraft;
	onDraftChange: (next: ExerciseTypeDraft | ((prev: ExerciseTypeDraft) => ExerciseTypeDraft)) => void;
	hexError: string | null;
	onHexErrorClear: () => void;
	t: (key: string) => string;
	nameInputId?: string;
	iconSelectId?: string;
	trackWeightSwitchId?: string;
};

export function ExerciseTypeEditorFields({
	draft,
	onDraftChange,
	hexError,
	onHexErrorClear,
	t,
	nameInputId = "ex-name",
	iconSelectId = "ex-icon",
	trackWeightSwitchId = "ex-track-weight",
}: Props) {
	return (
		<div className="flex flex-col gap-4">
			<ExerciseTypeIconAndPreviewFields
				draft={draft}
				onDraftChange={onDraftChange}
				t={t}
				nameInputId={nameInputId}
				iconSelectId={iconSelectId}
				trackWeightSwitchId={trackWeightSwitchId}
			/>
			<ExerciseTypeColorFields
				draft={draft}
				onDraftChange={onDraftChange}
				hexError={hexError}
				onHexErrorClear={onHexErrorClear}
				t={t}
			/>
		</div>
	);
}
