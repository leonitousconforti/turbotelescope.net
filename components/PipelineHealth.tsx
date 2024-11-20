"use client";

import { Result, useRx, useRxSet, useRxSuspenseSuccess, useRxValue } from "@effect-rx/rx-react";
import { DateTime } from "effect";
import { Suspense, useMemo } from "react";

import { AggregateBySelector } from "@/components/PipelineHealth/AggregateBySelector";
import { DatePickerWithRange } from "@/components/PipelineHealth/DatePickerRange";
import { EmptyBucketsToggle } from "@/components/PipelineHealth/EmptyBucketsToggle";
import { PipelineStepHistogram } from "@/components/PipelineHealth/PipelineStepHistogram";
import { AverageProcessingTimeLineChart } from "@/components/PipelineHealth/RunTimeHist";
import { RunsTable } from "@/components/PipelineHealth/Table";
import { fromRx, rowsRx, timeSeriesGroupedRx, totalsRx, untilRx } from "@/components/PipelineHealth/rx";
import { LocaleSelector } from "./PipelineHealth/LocaleSelector";

export function PipelineHealth() {
    // Sets
    const [_rows, pullRows] = useRx(rowsRx);
    useMemo(pullRows, [pullRows]);

    const pullTimeSeriesData = useRxSet(timeSeriesGroupedRx);
    useMemo(pullTimeSeriesData, [pullTimeSeriesData]);

    // Gets
    const from = useRxValue(fromRx).pipe(Result.getOrThrow);
    const until = useRxValue(untilRx).pipe(Result.getOrThrow);

    // Suspenses
    const totals = useRxSuspenseSuccess(totalsRx).value;

    return (
        <>
            <div className="flex justify-center my-4">
                <div className="mx-1">
                    <DatePickerWithRange />
                </div>
                <div className="mx-1">
                    <AggregateBySelector />
                </div>
                <div className="mx-1">
                    <EmptyBucketsToggle />
                </div>
                <div className="mx-1">
                    <LocaleSelector />
                </div>
            </div>
            <span className="flex justify-center my-4 text-sm text-muted-foreground">
                Selected {totals.totalRuns} runs between {DateTime.formatIso(from)} and {DateTime.formatIso(until)}
            </span>

            <Suspense fallback={<p>Loading...</p>}>
                <div className="my-2 mx-2">
                    <AverageProcessingTimeLineChart />
                </div>
                <div className="my-2 mx-2">
                    <PipelineStepHistogram />
                </div>
                <div className="my-2 mx-2">
                    <RunsTable />
                </div>
            </Suspense>
        </>
    );
}
