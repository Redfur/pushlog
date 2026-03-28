import { Navigate } from "react-router-dom";

/** Старый маршрут; редирект в `App.tsx`, страница оставлена для совместимости импортов. */
export function SettingsExercisesPage() {
	return <Navigate to="/" replace />;
}
