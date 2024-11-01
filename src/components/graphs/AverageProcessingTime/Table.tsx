import { Array, Function, Option, Predicate, Record } from "effect";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResultRow } from "@/services/Domain";

export function AverageProcessingTimeRunsTable({
    activeChart,
    activeLabel,
    timeSeriesDataGroupedByDay,
}: {
    activeChart: string;
    activeLabel: `${number}-${number}-${number}` | undefined;
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
    const tableData = Predicate.isNotUndefined(activeLabel)
        ? Function.pipe(
              timeSeriesDataGroupedByDay.groups,
              Record.get(activeLabel),
              Option.getOrThrow,
              ({ entries }) => entries,
              Array.filter(({ success }) => (activeChart.includes("Success") ? success : !success))
          )
        : ([] as Array<ResultRow>);

    return (
        <Table>
            <TableCaption>All runs for {activeLabel}</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead className="text-right">File</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tableData.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{row.objectId}</TableCell>
                        <TableCell>{row.completion}</TableCell>
                        <TableCell>{row.processingTime}</TableCell>
                        <TableCell className="text-right">{row.filePath}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            {/* <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">$2,500.00</TableCell>
                    </TableRow>
                </TableFooter> */}
        </Table>
    );
}
