import { useRxSuspenseSuccess } from "@effect-rx/rx-react";
import { DateTime } from "effect";

import { tableDataRx } from "@/components/PipelineHealth/rx";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { getSciURL, getRefURL, getDiffURL } from "@/lib/utils";
//import { DropdownMenuIcon } from "@radix-ui/react-icons";
import { DropdownMenuItem, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

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
                    <TableHead>Cutout</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tableData.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{DateTime.formatIso(row.run)}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.processingTime}</TableCell>
                        <TableCell>{row.file}</TableCell>
                        <TableCell>
                            <Link
                                href={{
                                    pathname: `/pipeline-health/verbose-logs/${row.file.includes("tlenaii") ? "tlenaii" : "popcorn"}/${row.schemaName}`,
                                    // pathname: getLogURL(
                                    //     row.schemaName,
                                    //     row.file.includes("tlenaii") ? "tlenaii" : "popcorn"
                                    // ),
                                }}
                                target="_blank"
                            >
                                View logs
                            </Link>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <ChevronDown />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>
                                        <Link
                                            key={1}
                                            href={{
                                                pathname: getSciURL(row.file),
                                            }}
                                            target="_blank"
                                        >
                                            {/* {row.status == "Yes" ? "View Image" : ""} */}
                                            Sci
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link
                                            key={2}
                                            href={{
                                                pathname: getDiffURL(row.file),
                                            }}
                                            target="_blank"
                                        >
                                            {/* {row.status == "Yes" ? "View Image" : ""} */}
                                            Diff
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link
                                            key={3}
                                            href={{
                                                pathname: getRefURL(row.file),
                                            }}
                                            target="_blank"
                                        >
                                            {/* {row.status == "Yes" ? "View Image" : ""} */}
                                            Ref
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
