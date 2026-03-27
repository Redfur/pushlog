import { Navigate, useParams } from "react-router-dom";
import { usePushlogStore } from "@/entities/pushup";
import { resolveDayRouteParam } from "@/shared/lib/day-key";
import { MainScreen } from "@/widgets/main-screen";

export function DayPage() {
	const { dayKey: raw } = useParams();
	const timeZone = usePushlogStore((s) => s.timeZone);
	const resolved = resolveDayRouteParam(raw, timeZone);

	if (!resolved) {
		return <Navigate to="/day/today" replace />;
	}

	return <MainScreen dayKey={resolved} />;
}
