import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type Props = {
	/** Кнопка «назад» и т.п. слева */
	leading?: ReactNode;
	/** Иконка или медиа перед заголовком */
	media?: ReactNode;
	title: ReactNode;
	description?: ReactNode;
	/** Кнопки справа */
	actions?: ReactNode;
	className?: string;
};

export function PageHeader({ leading, media, title, description, actions, className }: Props) {
	return (
		<div className={cn("flex flex-wrap items-start gap-2 sm:gap-3", className)}>
			{leading ? <div className="flex shrink-0 items-start pt-0.5">{leading}</div> : null}
			<div className="flex min-w-0 flex-1 items-start gap-3">
				{media ? <div className="shrink-0">{media}</div> : null}
				<div className="min-w-0 flex-1">
					<h1 className="text-xl font-semibold break-words">{title}</h1>
					{description ? <div className="text-muted-foreground mt-0.5 text-xs">{description}</div> : null}
				</div>
			</div>
			{actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 pt-0.5">{actions}</div> : null}
		</div>
	);
}
