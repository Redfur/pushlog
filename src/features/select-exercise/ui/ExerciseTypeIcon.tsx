import {
	Activity,
	ChevronsUp,
	Dumbbell,
	Flame,
	HeartPulse,
	type LucideIcon,
	PersonStanding,
	Target,
	Zap,
} from "lucide-react";
import type { CSSProperties } from "react";
import { isValidExerciseIconKey } from "@/shared/config/exercise-type-presets";
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
};

type Props = {
	iconKey: string;
	className?: string;
	style?: CSSProperties;
	"aria-hidden"?: boolean;
};

export function ExerciseTypeIcon({ iconKey, className, style, ...rest }: Props) {
	const key = isValidExerciseIconKey(iconKey) ? iconKey : "activity";
	const Icon = ICONS[key] ?? Activity;
	return <Icon className={cn("size-4 shrink-0", className)} style={style} {...rest} />;
}
