import { DateTime, Option, Record } from "effect";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useMemo } from "react";
import { pipeline_steps, short_pipeline_step } from "../rx";

const chart3 = "percentPipelineFailure" as const;

export const chartConfigs = {
    [chart3]: {
        color: "hsl(var(--chart-1))",
        title: "Percent failure",
        label: "Failed Pipeline Steps",
    },
} satisfies ChartConfig;

// export type MappedData = {
// [key in (typeof pipeline_steps)[number]]: {
//     [chart2]: number;
//     [chart3]: number;
// };
// };

export type MappedData = Array<{
    pipelineStep: (typeof pipeline_steps)[number];
    [chart3]: number;
}>;

export function PipelineStepTracker({
    dataIn,
    from,
    until,
}: {
    from: number;
    until: number;
    dataIn: Record<(typeof pipeline_steps)[number], { numOfFailures: number }>;
}) {
    const fromDateTime = useMemo(() => DateTime.make(from).pipe(Option.getOrThrow), [from]);
    const untilDateTime = useMemo(() => DateTime.make(until).pipe(Option.getOrThrow), [until]);

    const chartData: MappedData = Record.values(
        Record.map(dataIn, ({ numOfFailures }, key) => ({
            [chart3]: numOfFailures,
            pipelineStep: key,
        }))
    );

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Pipeline Step Failed</CardTitle>
                    <CardDescription>
                        Showing the number of failures at each Pipeline step {DateTime.formatIso(fromDateTime)} until{" "}
                        {DateTime.formatIso(untilDateTime)}
                    </CardDescription>
                </div>
                <div className="flex">
                    {[chart3].map((key) => {
                        const chart = key as typeof chart3;
                        return (
                            <button
                                key={chart}
                                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                            >
                                <span className="text-xs text-muted-foreground">{chartConfigs[chart].title}</span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">{key}</span>
                            </button>
                        );
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                {/*<ComposedChart width={400} height={400} data={chartData}>*/}
                <ChartContainer config={chartConfigs} className="aspect-auto h-[250px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="pipelineStep"
                            tickLine={true}
                            axisLine={false}
                            tickMargin={8}
                            //minTickGap={32}

                            // tickFormatter={Function.flow(
                            //     DateTime.make,
                            //     Option.getOrThrow,
                            //     DateTime.formatLocal({ locale: "en-US", month: "short", day: "numeric" })
                            // )}
                            tickFormatter={(longname: (typeof pipeline_steps)[number]) => {
                                return short_pipeline_step[longname];
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[275px]"
                                    // labelFormatter={Function.flow(
                                    //     DateTime.make,
                                    //     Option.getOrThrow,
                                    //     DateTime.formatLocal({
                                    //         locale: "en-US",
                                    //         month: "short",
                                    //         day: "numeric",
                                    //         year: "numeric",
                                    //     })
                                    // )}
                                />
                            }
                        />
                        <Bar dataKey={chart3} type="monotone" stroke={"#FF0000"} fill={"#FF0000"} strokeWidth={2} />
                    </BarChart>
                </ChartContainer>
                {/*</ComposedChart>*/}
            </CardContent>
        </Card>
    );
}
