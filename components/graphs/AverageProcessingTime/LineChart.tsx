import { Array, DateTime, Function, Option, Record } from "effect";
import { Bar, BarChart, CartesianGrid, Line, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ResultRow } from "@/services/Domain";
import { useMemo } from "react";

const chart1 = "thirtySecondThreshold" as const;
const chart2 = "averageSuccessProcessingTime" as const;
const chart3 = "averageFailureProcessingTime" as const;

export const chartConfigs = {
    [chart1]: {
        label: "30sec threshold",
        color: "hsl(var(--chart-3))",
    },
    [chart2]: {
        color: "hsl(var(--chart-2))",
        title: "Percent success",
        label: "Average successful processing time",
    },
    [chart3]: {
        color: "hsl(var(--chart-1))",
        title: "Percent failure",
        label: "Average failed processing time",
    },
} satisfies ChartConfig;

export type MappedData = Array<{
    date: string;
    [chart1]: number;
    [chart2]: number;
    [chart3]: number;
}>;

export function AverageProcessingTimeLineChart({
    activeChart,
    from,
    setActiveChart,
    setActiveLabel,
    timeSeriesDataGroupedByDay,
    until,
}: {
    activeChart: keyof typeof chartConfigs;
    from: number;
    until: number;
    setActiveChart: React.Dispatch<React.SetStateAction<keyof typeof chartConfigs>>;
    setActiveLabel: React.Dispatch<React.SetStateAction<`${number}-${number}-${number}` | undefined>>;
    timeSeriesDataGroupedByDay: {
        totals: {
            successRate: number;
            failureRate: number;
        };
        groups: Record<
            `${number}-${number}-${number}`,
            {
                entries: Array.NonEmptyReadonlyArray<ResultRow>;
                groupingKey: `${number}-${number}-${number}`;
                threshold: number;
                avgSuccessTime: number;
                avgFailTime: number;
            }
        >;
    };
}) {
    const fromDateTime = useMemo(() => DateTime.make(from).pipe(Option.getOrThrow), [from]);
    const untilDateTime = useMemo(() => DateTime.make(until).pipe(Option.getOrThrow), [until]);

    const totals = {
        [chart2]: timeSeriesDataGroupedByDay.totals.successRate,
        [chart3]: timeSeriesDataGroupedByDay.totals.failureRate,
    };

    const chartData: MappedData = Array.map(
        Record.values(timeSeriesDataGroupedByDay.groups),
        ({ avgFailTime, avgSuccessTime, groupingKey, threshold }) => ({
            date: groupingKey,
            [chart1]: threshold,
            [chart2]: avgSuccessTime,
            [chart3]: avgFailTime,
        })
    );

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Average processing time per day</CardTitle>
                    <CardDescription>
                        Showing the average processing time for runs from {DateTime.formatIso(fromDateTime)} until{" "}
                        {DateTime.formatIso(untilDateTime)}
                    </CardDescription>
                </div>
                <div className="flex">
                    {[chart2, chart3].map((key) => {
                        const chart = key as typeof chart2 | typeof chart3;
                        return (
                            <button
                                key={chart}
                                data-active={activeChart === chart}
                                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(chart)}
                            >
                                <span className="text-xs text-muted-foreground">{chartConfigs[chart].title}</span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    {totals[key as keyof typeof totals].toLocaleString()}%
                                </span>
                            </button>
                        );
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                {/*<ComposedChart width={400} height={400} data={chartData}>*/}
                <ChartContainer config={chartConfigs} className="aspect-auto h-[250px] w-full">
                    <BarChart
                        onClick={(event) => setActiveLabel(event.activeLabel as `${number}-${number}-${number}`)}
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={true}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={Function.flow(
                                DateTime.make,
                                Option.getOrThrow,
                                DateTime.formatLocal({ locale: "en-US", month: "short", day: "numeric" })
                            )}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[275px]"
                                    labelFormatter={Function.flow(
                                        DateTime.make,
                                        Option.getOrThrow,
                                        DateTime.formatLocal({
                                            locale: "en-US",
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    )}
                                />
                            }
                        />
                        <Bar
                            dataKey={activeChart}
                            type="monotone"
                            stroke={"#0000FF"}
                            fill={"#0000FF"}
                            strokeWidth={2}
                        />
                        <Line
                            dataKey={chart1}
                            type="monotone"
                            stroke={`var(--color-${chart1})`}
                            strokeWidth={1}
                            dot={false}
                        />
                    </BarChart>
                </ChartContainer>
                {/*</ComposedChart>*/}
            </CardContent>
        </Card>
    );
}
