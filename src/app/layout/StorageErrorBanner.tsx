import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { usePushlogStore } from "@/entities/pushup";
import { COMMON_NS } from "@/shared/i18n";

export function StorageErrorBanner() {
	const { t } = useTranslation(COMMON_NS);
	const lastError = usePushlogStore((s) => s.lastError);
	const clearError = usePushlogStore((s) => s.clearError);

	if (!lastError) return null;

	return (
		<div
			role="alert"
			className="bg-destructive text-destructive-foreground fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-2 px-3 py-2 text-sm lg:left-64"
		>
			<span className="min-w-0 flex-1 truncate">{t("storageError", { message: lastError })}</span>
			<Button type="button" size="sm" variant="secondary" onClick={() => clearError()}>
				{t("ok")}
			</Button>
		</div>
	);
}
