"use client";

import { Result, useRx } from "@effect-rx/rx-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { AverageProcessingTimeLineChart, chartConfigs } from "@/components/graphs/AverageProcessingTime/LineChart";
import { AverageProcessingTimeRunsTable } from "@/components/graphs/AverageProcessingTime/Table";
import { tally_pipeline_steps, timeSeriesGroupedByDayRx } from "@/components/graphs/rx";
import { DatePickerWithRange } from "./AverageProcessingTime/DatePickerRange";
import { PipelineStepTracker } from "./AverageProcessingTime/PipeStepHist";

export function AverageProcessingTime() {
    const [timeSeriesDataGroupedByDay, fetchTimeSeriesData] = useRx(timeSeriesGroupedByDayRx);
    const [dataIn, fetchDataIn] = useRx(tally_pipeline_steps);
    const [activeLabel, setActiveLabel] = useState<`${number}-${number}-${number}` | undefined>(undefined);
    const [activeChart, setActiveChart] = useState<keyof typeof chartConfigs>("averageSuccessProcessingTime");
    const [dates, setDates] = useState<DateRange | undefined>({ from: undefined, to: undefined });

    // const until = Effect.runSync(DateTime.now).pipe(DateTime.toEpochMillis);
    // const from = Effect.runSync(DateTime.make("2024-08-01")).pipe(DateTime.toEpochMillis);

    const from = dates?.from?.getTime();
    const until = dates?.to?.getTime();

    useEffect(() => {
        if (from && until) {
            fetchTimeSeriesData({ from, until });
            fetchDataIn({ from, until });
        }
    }, [from, until]);

    if (!from || !until) {
        return (
            <>
                <DatePickerWithRange date={dates} setDate={setDates}></DatePickerWithRange>
                <p>Need to select dates</p>
            </>
        );
    }

    if (Result.isInitial(timeSeriesDataGroupedByDay) || Result.isInitial(dataIn)) {
        return <p>Loading...</p>;
    }

    if (
        Result.isFailure(timeSeriesDataGroupedByDay) ||
        Result.isInterrupted(timeSeriesDataGroupedByDay) ||
        Result.isFailure(dataIn) ||
        Result.isInterrupted(dataIn)
    ) {
        return <p>Very BAD</p>;
    }

    if (!Result.isSuccess(timeSeriesDataGroupedByDay) || !Result.isSuccess(dataIn)) {
        return <p>idek</p>;
    }

    return (
        <>
            <DatePickerWithRange date={dates} setDate={setDates}></DatePickerWithRange>
            <AverageProcessingTimeLineChart
                from={from}
                until={until}
                activeChart={activeChart}
                setActiveLabel={setActiveLabel}
                setActiveChart={setActiveChart}
                timeSeriesDataGroupedByDay={timeSeriesDataGroupedByDay.value}
            />
            <PipelineStepTracker from={from} until={until} dataIn={dataIn.value} />
            <AverageProcessingTimeRunsTable
                activeChart={activeChart}
                activeLabel={activeLabel}
                timeSeriesDataGroupedByDay={timeSeriesDataGroupedByDay.value}
            />
        </>
    );
}
