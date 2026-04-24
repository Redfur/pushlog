import NiceModal from "@ebay/nice-modal-react";
import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { PushlogHydrationProvider } from "@/app/providers/pushlog-hydration";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { i18n } from "@/shared/lib/i18n";
import "@/shared/i18n";

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<I18nextProvider i18n={i18n}>
			<NiceModal.Provider>
				<TooltipProvider>
					<PushlogHydrationProvider>
						{children}
						<Toaster />
					</PushlogHydrationProvider>
				</TooltipProvider>
			</NiceModal.Provider>
		</I18nextProvider>
	);
}
