"use client";

import { useRx, useRxSet, useRxSuspenseSuccess } from "@effect-rx/rx-react";
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
import { Steps2querySelector } from "./PipelineHealth/StepsFilter";

export function PipelineHealth() {
    // Sets
    const [_rows, pullRows] = useRx(rowsRx);
    useMemo(pullRows, [pullRows]);

    const pullTimeSeriesData = useRxSet(timeSeriesGroupedRx);
    useMemo(pullTimeSeriesData, [pullTimeSeriesData]);

    const updateFrom = useRxSet(fromRx);
    useMemo(() => updateFrom(new Date("2024-11-19")), [updateFrom]);

    const updateUntil = useRxSet(untilRx);
    useMemo(() => updateUntil(new Date()), [updateUntil]);

    // Gets
    const from = useRxSuspenseSuccess(fromRx).value;
    const until = useRxSuspenseSuccess(untilRx).value;
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
                <div className="mx-1">
                    <Steps2querySelector />
                </div>
            </div>
            <span className="flex justify-center my-4 text-sm text-muted-foreground">
                Selected {totals.totalRuns} images between {DateTime.formatIsoZoned(from)} and{" "}
                {DateTime.formatIsoZoned(until)}
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
