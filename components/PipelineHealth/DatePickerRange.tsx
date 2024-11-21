"use client";

import { Result, useRx, useRxValue } from "@effect-rx/rx-react";
import { format } from "date-fns";
import { DateTime, Predicate } from "effect";
import { Calendar as CalendarIcon } from "lucide-react";
import { HTMLAttributes, useState } from "react";
import { DateRange } from "react-day-picker";

import { fromRx, localeRx, untilRx } from "@/components/PipelineHealth/rx";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePickerWithRange({ className }: HTMLAttributes<HTMLDivElement>) {
    const [from, updateFrom] = useRx(fromRx);
    const [until, updateUntil] = useRx(untilRx);
    const _locale = useRxValue(localeRx).pipe(Result.getOrThrow);

    const [date, setDate] = useState<DateRange | undefined>({
        from: DateTime.toDate(Result.getOrThrow(from)),
        to: DateTime.toDate(Result.getOrThrow(until)),
    });

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(dates) => {
                            setDate(dates);
                            if (Predicate.isNotUndefined(dates?.from)) updateFrom(dates.from);
                            if (Predicate.isNotUndefined(dates?.to)) updateUntil(dates.to);
                        }}
                        numberOfMonths={2}
                        // timeZone="America/Chicago"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
