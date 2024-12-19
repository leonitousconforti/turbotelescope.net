"use client";

import { Result, Rx, useRxSet, useRxSuspenseSuccess } from "@effect-rx/rx-react";
import { FetchHttpClient, HttpClient, HttpClientError } from "@effect/platform";
import { Effect, Scope, Stream } from "effect";

import { rpcClient } from "@/app/api/client";
import { SchemaName, VerboseLogRequest, VerboseLogURLRequest } from "@/services/Domain";
import { useMemo } from "react";

const runtime = Rx.runtime(FetchHttpClient.layer);

const machineRx = Rx.make<"tlenaii" | "popcorn">("popcorn" as const);
const schemaNameRx = Rx.make<typeof SchemaName.from.Type>(
    "" as `science_turbo_production_pipeline_${number}_${number}_${number}_${number}_${number}_${number}`
);

const _verboseLogRx: Rx.Writable<Rx.PullResult<Uint8Array, never>, void> = runtime.pull(
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
        disableAccumulation: true,
    }
);

const verboseLogURLRx: Rx.Rx<Result.Result<string, never>> = runtime.rx(
    (
        context: Rx.Context
    ): Effect.Effect<string, never, HttpClient.HttpClient<HttpClientError.HttpClientError, Scope.Scope>> =>
        Effect.Do.pipe(
            Effect.let("machine", () => context.get(machineRx)),
            Effect.let("schemaName", () => context.get(schemaNameRx)),
            Effect.let("request", ({ machine, schemaName }) => new VerboseLogURLRequest({ schemaName, machine })),
            Effect.bind("client", () => rpcClient),
            Effect.flatMap(({ client, request }) => client(request))
        )
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
    const verboseLogs = useRxSuspenseSuccess(verboseLogURLRx).value;

    // Content
    //const all = verboseLogs.items.map((item) => new TextDecoder().decode(item)).join("\n");

    return <p>{verboseLogs}</p>;
}
