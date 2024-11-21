"use client";

import { Rx, useRxSet, useRxSuspenseSuccess } from "@effect-rx/rx-react";
import { FetchHttpClient, HttpClient, HttpClientError } from "@effect/platform";
import { Scope, Stream } from "effect";

import { rpcClient } from "@/app/api/client";
import { SchemaName, VerboseLogRequest } from "@/services/Domain";
import { useMemo } from "react";

const runtime = Rx.runtime(FetchHttpClient.layer);

const machineRx = Rx.make<"tlenaii" | "popcorn">("popcorn" as const);
const schemaNameRx = Rx.make<typeof SchemaName.from.Type>(
    "" as `science_turbo_production_pipeline_${number}_${number}_${number}_${number}_${number}_${number}`
);

const verboseLogRx: Rx.Writable<Rx.PullResult<Uint8Array, never>, void> = runtime.pull(
    (
        context: Rx.Context
    ): Stream.Stream<Uint8Array, never, HttpClient.HttpClient<HttpClientError.HttpClientError, Scope.Scope>> =>
        Stream.Do.pipe(
            Stream.let("machine", () => context.get(machineRx)),
            Stream.let("schemaName", () => context.get(schemaNameRx)),
            Stream.let("request", ({ machine, schemaName }) => new VerboseLogRequest({ schemaName, machine })),
            Stream.bind("client", () => rpcClient),
            Stream.flatMap(({ client, request }) => client(request))
        ),
    {
        disableAccumulation: false,
    }
);

export function LogViewer({
    machine,
    schemaName,
}: {
    machine: "tlenaii" | "popcorn";
    schemaName: typeof SchemaName.Encoded;
}) {
    // Sets
    const setMachineName = useRxSet(machineRx);
    const setSchemaName = useRxSet(schemaNameRx);
    useMemo(() => setMachineName(machine), [machine, setMachineName]);
    useMemo(() => setSchemaName(schemaName), [schemaName, setSchemaName]);

    // Suspenses
    const verboseLogs = useRxSuspenseSuccess(verboseLogRx).value;

    // Content
    const all = verboseLogs.items.map((item) => new TextDecoder().decode(item)).join("\n");
    return <p>{all}</p>;
}
