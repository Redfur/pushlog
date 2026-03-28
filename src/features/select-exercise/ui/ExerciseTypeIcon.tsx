import {
	Activity,
	Award,
	Bike,
	ChevronsUp,
	Coffee,
	Dumbbell,
	Flame,
	Footprints,
	HeartPulse,
	type LucideIcon,
	Medal,
	Mountain,
	Music,
	PersonStanding,
	Sparkles,
	Star,
	Target,
	Timer,
	Trophy,
	Waves,
	Zap,
} from "lucide-react";
import type { CSSProperties } from "react";
import { type ExerciseTypeIconVisual, isValidExerciseIconKey } from "@/shared/config/exercise-type-presets";
import { cn } from "@/shared/lib/utils";

const ICONS: Record<string, LucideIcon> = {
	dumbbell: Dumbbell,
	"chevrons-up": ChevronsUp,
	activity: Activity,
	zap: Zap,
	flame: Flame,
	target: Target,
	"heart-pulse": HeartPulse,
	"person-standing": PersonStanding,
	bike: Bike,
	footprints: Footprints,
	waves: Waves,
	timer: Timer,
	medal: Medal,
	mountain: Mountain,
	award: Award,
	star: Star,
	sparkles: Sparkles,
	music: Music,
	coffee: Coffee,
	trophy: Trophy,
};

type Props = {
	exerciseType: ExerciseTypeIconVisual;
	className?: string;
	style?: CSSProperties;
	"aria-hidden"?: boolean;
};

export function ExerciseTypeIcon({
	exerciseType,
	className = "size-4 shrink-0",
	style,
	"aria-hidden": ariaHidden,
}: Props) {
	if (exerciseType.iconDisplay === "text") {
		const raw = exerciseType.iconEmojiText.trim();
		const glyph = raw || exerciseType.nameInitialGlyph || "·";
		const { color: accentColor, backgroundColor: explicitBg, ...restStyle } = style ?? {};
		const textModeStyle: CSSProperties = {
			...restStyle,
			...(explicitBg != null ? { backgroundColor: explicitBg } : {}),
			...(explicitBg == null && accentColor != null ? { backgroundColor: accentColor } : {}),
		};
		return (
			<span
				className={cn("inline-flex items-center justify-center overflow-hidden rounded-md leading-none", className)}
				style={textModeStyle}
				aria-hidden={ariaHidden}
			>
				{glyph}
			</span>
		);
	}

	const key = isValidExerciseIconKey(exerciseType.iconKey) ? exerciseType.iconKey : "activity";
	const Icon = ICONS[key] ?? Activity;
	return <Icon className={className} style={style} aria-hidden={ariaHidden} />;
}

export type { ExerciseTypeIconVisual } from "@/shared/config/exercise-type-presets";
