"use client";

import { Result, useRx } from "@effect-rx/rx-react";
import { DateTime } from "effect";

import { localeRx } from "@/components/PipelineHealth/rx";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LocaleSelector() {
    const [locale, setLocale] = useRx(localeRx);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <span>Select locale</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                    value={DateTime.zoneToString(Result.getOrThrow(locale))}
                    onValueChange={(str) => setLocale(str as "UTC" | "America/Chicago")}
                >
                    <DropdownMenuRadioItem value={"UTC"}>Utc</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={"America/Chicago"}>America/Chicago</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
