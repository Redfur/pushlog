import { useEffect } from "react";
import { usePushlogStore } from "@/entities/pushup";

export function PushlogHydrationProvider({ children }: { children: React.ReactNode }) {
	const hydrate = usePushlogStore((s) => s.hydrate);

	useEffect(() => {
		void hydrate();
	}, [hydrate]);

	return children;
}
