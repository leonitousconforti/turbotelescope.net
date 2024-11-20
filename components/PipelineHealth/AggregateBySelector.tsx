"use client";

import { useRx, useRxValue } from "@effect-rx/rx-react";

import { aggregateByRx, includeEmptyBucketsRx } from "@/components/PipelineHealth/rx";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AggregateBySelector() {
    // Gets
    const showEmptyBuckets = useRxValue(includeEmptyBucketsRx);

    // Sets
    const [aggregateBy, setAggregateBy] = useRx(aggregateByRx);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <span>Aggregate by</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                    value={aggregateBy}
                    onValueChange={(str) =>
                        setAggregateBy(str as "seconds" | "minutes" | "hours" | "days" | "months" | "years")
                    }
                >
                    <DropdownMenuRadioItem value={"seconds"} disabled={showEmptyBuckets}>
                        Seconds{showEmptyBuckets && " (disabled)"}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={"minutes"} disabled={showEmptyBuckets}>
                        Minutes{showEmptyBuckets && " (disabled)"}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={"hours"}>Hours</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={"days"}>Days</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={"months"}>Months</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={"years"}>Years</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
