import { Result, useRx, useRxSet, useRxSuspense, useRxValue } from "@effect-rx/rx-react";
import { CheckIcon, Cross2Icon, DotFilledIcon } from "@radix-ui/react-icons";
import { DateTime, Function, Option, Record } from "effect";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, XAxis, YAxis } from "recharts";

import {
    activeDataRx,
    activeLabelRx,
    aggregateByRx,
    timeSeriesGroupedRx,
    totalsRx,
} from "@/components/PipelineHealth/rx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chart1 = "thirtySecondThreshold" as const;
const chart2 = "averageSuccessProcessingTime" as const;
const chart3 = "averageFailureProcessingTime" as const;
const chart4 = "numberOfSuccessfulRuns" as const;
const chart5 = "numberOfFailedRuns" as const;

export const chartConfigs = {
    [chart1]: {
        label: "30sec threshold",
        color: "hsl(var(--chart-3))",
        icon: DotFilledIcon,
    },
    [chart2]: {
        color: "#00cc00",
        title: "Percent success",
        label: "Average successful processing time",
        icon: CheckIcon,
    },
    [chart3]: {
        color: "#FF0000",
        title: "Percent failure",
        label: "Average failed processing time",
        icon: Cross2Icon,
    },
    [chart5]: {
        color: "#FF0000",
        title: "Number of Failed of Runs",
        label: "Number of Failed Runs",
        icon: Cross2Icon,
    },
    [chart4]: {
        color: "#FF0000",
        title: "Number of Successful Runs",
        label: "Number of Succcessful Runs",
        icon: CheckIcon,
    },
} satisfies ChartConfig;

export type MappedData = Array<{
    date: string;
    [chart1]: number;
    [chart2]: number;
    [chart3]: number;
    [chart4]: number;
    [chart5]: number;
}>;

export function AverageProcessingTimeLineChart() {
    // Gets
    const aggregateBy = useRxValue(aggregateByRx);

    // Sets
    const setActiveLabel = useRxSet(activeLabelRx);
    const [activeChart, setActiveChart] = useRx(activeDataRx);

    // Suspends
    const totals = useRxSuspense(totalsRx);
    const timeSeriesData = useRxSuspense(timeSeriesGroupedRx);

    // Error handling
    if (!Result.isSuccess(timeSeriesData) || !Result.isSuccess(totals)) {
        return <p>BAD</p>;
    }

    // Data mapping
    const chartTotals = {
        [chart2]: totals.value.successRate,
        [chart3]: totals.value.failureRate,
    };
    const chartData: MappedData = Record.values(
        Record.map(
            timeSeriesData.value,
            ({ avgFailTime, avgSuccessTime, numberFailedRuns, numberSuccessfulRuns, threshold }, key) => ({
                date: key,
                [chart1]: threshold,
                [chart2]: avgSuccessTime,
                [chart3]: avgFailTime,
                [chart4]: numberFailedRuns,
                [chart5]: numberSuccessfulRuns,
            })
        )
    );
    //console.log(chartData);
    const activeChartKey = activeChart === "success" ? chart2 : chart3;
    // Chart implementation
    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Average processing time per day</CardTitle>
                    <CardDescription>
                        Showing the average processing time for {activeChart} runs grouped by {aggregateBy}
                    </CardDescription>
                </div>
                <div className="flex">
                    {[chart2, chart3].map((chart) => {
                        return (
                            <button
                                key={chart}
                                data-active={chart.toLocaleLowerCase().includes(activeChart)}
                                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                                onClick={() =>
                                    chart === "averageSuccessProcessingTime"
                                        ? setActiveChart("success")
                                        : setActiveChart("failure")
                                }
                            >
                                <span className="text-xs text-muted-foreground">{chartConfigs[chart].title}</span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    {chartTotals[chart].toFixed(1)}%
                                </span>
                            </button>
                        );
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer config={chartConfigs} className="aspect-auto h-[250px] w-full">
                    <ComposedChart
                        onClick={(event) => setActiveLabel(event.activeLabel)}
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid />
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
                        <YAxis tickLine={true} axisLine={false} tickMargin={8} tickFormatter={(value) => `${value}s`} />
                        <ChartTooltip
                            includeHidden
                            payloadUniqBy={({ dataKey }) => dataKey}
                            content={
                                <ChartTooltipContent
                                    className="w-[300px]"
                                    labelFormatter={Function.flow(
                                        DateTime.make,
                                        Option.getOrThrow,
                                        DateTime.formatLocal({
                                            locale: "en-US",
                                            second: "numeric",
                                            minute: "numeric",
                                            hour: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    )}
                                />
                            }
                        />
                        <Legend
                            payload={[
                                {
                                    id: activeChartKey,
                                    type: "square",
                                    value: chartConfigs[activeChartKey].label,
                                    color: chartConfigs[activeChartKey].color,
                                },
                                {
                                    id: chart1,
                                    type: "line",
                                    value: chartConfigs[chart1].label,
                                    color: chartConfigs[chart1].color,
                                },
                            ]}
                            verticalAlign="top"
                            align="left"
                            height={36}
                        />
                        <Bar
                            key={activeChart === "success" ? `${chart2}-bar` : `${chart3}-bar`}
                            dataKey={activeChart === "success" ? chart2 : chart3}
                            type="monotone"
                            fill={`var(--color-${activeChart === "success" ? chart2 : chart3})`}
                            fillOpacity={0.5}
                        />
                        <Line
                            dataKey={chart1}
                            type="monotone"
                            stroke={`var(--color-${chart1})`}
                            strokeWidth={1}
                            strokeDasharray={"3 3"}
                            dot={false}
                        />
                        {/* Enables Chart of Hover based on active chart */}
                        {activeChart === "success" ? (
                            <Line dataKey={chart4} hide />
                        ) : activeChart === "failure" ? (
                            <Line dataKey={chart5} hide />
                        ) : null}
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
