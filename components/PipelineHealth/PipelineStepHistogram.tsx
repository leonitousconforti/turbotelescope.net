import { useRxSuspenseSuccess } from "@effect-rx/rx-react";
import { Array, Function, Record, Tuple } from "effect";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { rowsRx } from "@/components/PipelineHealth/rx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PipelineStepName } from "@/services/Domain";

const chart1 = "pipelineFailureStep" as const;

export const chartConfigs = {
    [chart1]: {
        color: "hsl(var(--chart-1))",
        label: "Failed Pipeline Steps",
    },
} satisfies ChartConfig;

export type MappedData = Array<{
    [chart1]: number;
    pipelineStep: typeof PipelineStepName.Type;
}>;

export function PipelineStepHistogram() {
    const rows = useRxSuspenseSuccess(rowsRx).value;

    const chartData: MappedData = Function.pipe(
        Array.partition(rows, ({ success }) => success),
        Tuple.getFirst,
        Array.groupBy(({ pipelineStep }) => pipelineStep),
        Record.map((rows, key) => ({ [chart1]: rows.length, pipelineStep: key as typeof PipelineStepName.Type })),
        Record.values
    );

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Pipeline step failures</CardTitle>
                    <CardDescription>Showing the number of failures at each pipeline step</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
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
                            // tickFormatter={(longName: (typeof pipeline_steps)[number]) => {
                            //     return short_pipeline_step[longname];
                            // }}
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
                        <Bar dataKey={chart1} type="monotone" stroke={"#FF0000"} fill={"#FF0000"} strokeWidth={2} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
