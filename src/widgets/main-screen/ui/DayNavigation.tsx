import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePushlogStore } from "@/entities/pushup";
import { type DayKey, dayKeyToLocalDate, localDateToDayKey, nowDayKey, offsetDayKey } from "@/shared/lib/day-key";
import { bcp47FromI18nLang, formatDayKeyFriendly } from "@/shared/lib/format-day";
import { MAIN_SCREEN_NS } from "../translations";

type Props = {
	dayKey: DayKey;
	timeZone: string;
};

const dayCalendarHasSetsClass =
	"[&_button]:relative [&_button]:after:pointer-events-none [&_button]:after:absolute [&_button]:after:bottom-0.25 [&_button]:after:left-1/2 [&_button]:after:size-1 [&_button]:after:-translate-x-1/2 [&_button]:after:rounded-full [&_button]:after:bg-primary [&_button[data-selected-single=true]]:after:bg-primary-foreground";

export function DayNavigation({ dayKey, timeZone }: Props) {
	const { t, i18n } = useTranslation(MAIN_SCREEN_NS);
	const navigate = useNavigate();
	const [pickerOpen, setPickerOpen] = useState(false);
	const sets = usePushlogStore((s) => s.sets);
	const dayKeysWithSets = useMemo(() => {
		const next = new Set<DayKey>();
		for (const row of sets) {
			next.add(row.dayKey);
		}
		return next;
	}, [sets]);
	const todayKey = nowDayKey(timeZone);
	const yesterdayKey = offsetDayKey(todayKey, -1, timeZone);
	const prevKey = offsetDayKey(dayKey, -1, timeZone);
	const nextKey = offsetDayKey(dayKey, 1, timeZone);
	const canGoNext = nextKey <= todayKey;
	const locale = bcp47FromI18nLang(i18n.language);
	const label =
		dayKey === todayKey
			? t("title")
			: dayKey === yesterdayKey
				? t("titleYesterday")
				: formatDayKeyFriendly(dayKey, locale);
	const selectedDate = dayKeyToLocalDate(dayKey);

	return (
		<div className="flex items-center gap-1">
			<Button type="button" variant="outline" size="icon" asChild>
				<Link to={`/day/${prevKey}`} replace aria-label={t("dayNavPrev")}>
					<ChevronLeft className="size-5" />
				</Link>
			</Button>
			<Popover open={pickerOpen} onOpenChange={setPickerOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						className="text-foreground hover:bg-accent/60 min-h-11 min-w-0 flex-1 px-2 text-lg font-semibold"
						aria-expanded={pickerOpen}
						aria-haspopup="dialog"
						title={t("dayNavPickDate")}
					>
						{label}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="center" sideOffset={8}>
					<Calendar
						mode="single"
						locale={ru}
						defaultMonth={selectedDate}
						selected={selectedDate}
						disabled={(date) => localDateToDayKey(date) > todayKey}
						modifiers={{
							hasSets: (date) => dayKeysWithSets.has(localDateToDayKey(date)),
						}}
						modifiersClassNames={{
							hasSets: dayCalendarHasSetsClass,
						}}
						onSelect={(date) => {
							if (date) {
								navigate(`/day/${localDateToDayKey(date)}`, { replace: true });
								setPickerOpen(false);
							}
						}}
						autoFocus
					/>
				</PopoverContent>
			</Popover>
			{canGoNext ? (
				<Button type="button" variant="outline" size="icon" asChild>
					<Link to={`/day/${nextKey}`} replace aria-label={t("dayNavNext")}>
						<ChevronRight className="size-5" />
					</Link>
				</Button>
			) : (
				<Button type="button" variant="outline" size="icon" disabled aria-label={t("dayNavNext")}>
					<ChevronRight className="size-5" />
				</Button>
			)}
		</div>
	);
}
