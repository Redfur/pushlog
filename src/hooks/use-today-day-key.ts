import { useEffect, useState } from "react";
import { nowDayKey } from "@/shared/lib/day-key";

/** Обновляет dayKey при возврате на вкладку и раз в минуту (полночь / смена дня). */
export function useTodayDayKey(timeZone: string): string {
	const [dayKey, setDayKey] = useState(() => nowDayKey(timeZone));

	useEffect(() => {
		const tick = () => setDayKey(nowDayKey(timeZone));
		const id = window.setInterval(tick, 60_000);
		document.addEventListener("visibilitychange", tick);
		return () => {
			window.clearInterval(id);
			document.removeEventListener("visibilitychange", tick);
		};
	}, [timeZone]);

	return dayKey;
}
