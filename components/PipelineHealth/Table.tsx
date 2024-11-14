import { useRxSuspenseSuccess } from "@effect-rx/rx-react";
import { DateTime } from "effect";

import { tableDataRx } from "@/components/PipelineHealth/rx";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export function RunsTable() {
    const tableData = useRxSuspenseSuccess(tableDataRx).value;

    return (
        <Table>
            <TableCaption>All runs for {"activeLabel"}</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead className="text-right">Verbose logs</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tableData.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{DateTime.formatIso(row.run)}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.processingTime}</TableCell>
                        <TableCell>{row.file}...</TableCell>
                        <TableCell className="text-right">
                            <Link
                                href={{
                                    pathname: `/pipeline-health/verbose-logs/${row.file.includes("tlenaii") ? "tlenaii" : "popcorn"}/${row.schemaName}`,
                                }}
                            >
                                View logs
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
