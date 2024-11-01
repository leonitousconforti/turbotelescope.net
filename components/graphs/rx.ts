"use client";

import { Rx } from "@effect-rx/rx-react";
import { FetchHttpClient, HttpClient, HttpClientError } from "@effect/platform";
import { Array, Cause, DateTime, Effect, Number, Option, ParseResult, Record, Scope } from "effect";

import { rpcClient } from "@/rpc/client";
import { DataInTimeRangeRequest, ResultRow } from "@/services/Domain";

export const pipeline_steps = [
    "Bad pix map generation",
    "Basic data reduction",
    "Subtract Background and generate source cat",
    "filter image by the shape of sources",
    "Assign Reference",
    "Align ref to sci and propagate wcs from ref to sci",
    "Align ref to sci and propagate wcs from ref to sci",
    "Run Sfft Subtraction",
    "Extract sources from difference image",
    "Grabbing catalogs for this region of sky",
    "Filter out candidates close to stars ",
    "Filter out blurry imgs",
    "Calculate zeropoint of image",
    "Calculate real-bogus score for candidates",
    "Making cutouts ",
    "make_lightcurve",
    "save the image",
] as const;

export const short_pipeline_step: {
    [key in (typeof pipeline_steps)[number]]: string;
} = {
    ["Bad pix map generation"]: "Bad Pix Map",
    ["Basic data reduction"]: "Data Reduction",
    ["Subtract Background and generate source cat"]: "Subtract",
    ["filter image by the shape of sources"]: "Filter",
    ["Assign Reference"]: "Assign Reference",
    ["Align ref to sci and propagate wcs from ref to sci"]: "Align Ref",
    ["Run Sfft Subtraction"]: "Run Sfft",
    ["Extract sources from difference image"]: "Extract Sources",
    ["Grabbing catalogs for this region of sky"]: "Catalogs",
    ["Filter out candidates close to stars "]: "Fltr CTS",
    ["Filter out blurry imgs"]: "Flr Blurry Imgs",
    ["Calculate zeropoint of image"]: "Zero Point",
    ["Calculate real-bogus score for candidates"]: "Real-Bogus",
    ["Making cutouts "]: "Cutouts",
    ["make_lightcurve"]: "Lightcurve",
    ["save the image"]: "Save",
};

const runtime = Rx.runtime(FetchHttpClient.layer);
const timeDataRx = ({
    from,
    until,
}: {
    from: number;
    until: number;
}): Effect.Effect<
    Array<ResultRow>,
    ParseResult.ParseError,
    HttpClient.HttpClient<HttpClientError.HttpClientError, Scope.Scope>
> =>
    Effect.Do.pipe(
        Effect.bind("request", () =>
            Effect.succeed(
                new DataInTimeRangeRequest({
                    from: DateTime.make(from).pipe(Option.getOrThrow),
                    until: DateTime.make(until).pipe(Option.getOrThrow),
                })
            )
        ),
        Effect.bind("client", () => rpcClient),
        Effect.flatMap(({ client, request }) => client(request)),
        Effect.map(Record.values),
        Effect.map(Array.flatten)
    );

const totalsRx = (data: Array<ResultRow>): { successRate: number; failureRate: number } => {
    const total = data.length;
    const [failures, successes] = Array.partition(data, ({ success }) => success);
    const failureRate = Number.divide(failures.length, total).pipe(Option.getOrElse(() => 0)) * 100;
    const successRate = Number.divide(successes.length, total).pipe(Option.getOrElse(() => 0)) * 100;
    return { successRate, failureRate };
};

export const timeSeriesGroupedByDayRx: Rx.RxResultFn<
    {
        from: number;
        until: number;
    },
    {
        totals: {
            successRate: number;
            failureRate: number;
        };
        groups: Record<
            `${number}-${number}-${number}`,
            {
                threshold: number;
                avgFailTime: number;
                avgSuccessTime: number;
                entries: Array.NonEmptyReadonlyArray<ResultRow>;
                groupingKey: `${number}-${number}-${number}`;
            }
        >;
    },
    ParseResult.ParseError | Cause.NoSuchElementException
> = runtime.fn(({ from, until }: { from: number; until: number }, _get: Rx.Context) =>
    Effect.gen(function* () {
        const rows = yield* timeDataRx({ from, until });
        const totals = totalsRx(rows);

        const dataWithGroupingKey = yield* Effect.all(
            Array.map(rows, (row) =>
                Effect.gen(function* () {
                    const data = yield* DateTime.make(row.date);
                    const parts = DateTime.toParts(data);
                    return { ...row, groupingKey: `${parts.year}-${parts.month}-${parts.day}` as const };
                })
            )
        );

        const groups = Array.groupBy(dataWithGroupingKey, ({ groupingKey }) => groupingKey);

        const groupsWithAverages = Record.map(groups, (group) => {
            const [failures, successes] = Array.partition(group, ({ success }) => success);
            const cumFailTim = Number.sumAll(Array.map(failures, ({ processingTime }) => processingTime));
            const cumSuccessTime = Number.sumAll(Array.map(successes, ({ processingTime }) => processingTime));
            const avgFailTime = Number.divide(cumFailTim, failures.length).pipe(Option.getOrElse(() => 0));
            const avgSuccessTime = Number.divide(cumSuccessTime, successes.length).pipe(Option.getOrElse(() => 0));
            return {
                entries: group,
                groupingKey: group[0].groupingKey,
                threshold: 30,
                avgSuccessTime,
                avgFailTime,
            };
        });

        return { totals, groups: groupsWithAverages };
    })
);

export const tally_pipeline_steps = runtime.fn(({ from, until }: { from: number; until: number }, _get: Rx.Context) =>
    Effect.gen(function* () {
        const rows = yield* timeDataRx({ from, until });
        const a = Array.filter(rows, (row) => {
            return pipeline_steps.includes(row.pipelineStep as (typeof pipeline_steps)[number]);
        });
        const b = Array.groupBy(a, (row) => {
            return row.pipelineStep;
        });
        const c = Record.map(b, (value) => {
            const d = Array.partition(value, (row) => {
                return row.success;
            });
            return { numOfFailures: d[0].length };
        });
        return c;
    })
);
