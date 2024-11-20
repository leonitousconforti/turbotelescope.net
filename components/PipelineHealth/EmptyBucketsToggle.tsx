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

export function EmptyBucketsToggle() {
    // Gets
    const aggregateBy = useRxValue(aggregateByRx);

    // Sets
    const [showEmptyBuckets, setShowEmptyBuckets] = useRx(includeEmptyBucketsRx);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <span>Show empty buckets</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={showEmptyBuckets.toString()}>
                    <DropdownMenuRadioItem value={"false"} onClick={() => setShowEmptyBuckets(false)}>
                        No
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                        value={"true"}
                        disabled={aggregateBy === "seconds" || aggregateBy === "minutes"}
                        onClick={() => setShowEmptyBuckets(true)}
                    >
                        Yes{(aggregateBy === "seconds" || aggregateBy === "minutes") && " (disabled)"}
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
