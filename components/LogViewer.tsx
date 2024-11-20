"use client";

import { Result, Rx, useRx } from "@effect-rx/rx-react";
import { FetchHttpClient, HttpClient, HttpClientError } from "@effect/platform";
import { Effect, Scope } from "effect";

import { rpcClient } from "@/rpc/client";
import { SchemaName, VerboseLogRequest } from "@/services/Domain";
import { useMemo } from "react";

const runtime = Rx.runtime(FetchHttpClient.layer);

const verboseLogRx: Rx.RxResultFn<
    { schemaName: typeof SchemaName.from.Type; machine: "tlenaii" | "popcorn" },
    string,
    never
> = runtime.fn(
    (
        { machine, schemaName }: { schemaName: typeof SchemaName.from.Type; machine: "tlenaii" | "popcorn" },
        _context: Rx.Context
    ): Effect.Effect<string, never, HttpClient.HttpClient<HttpClientError.HttpClientError, Scope.Scope>> =>
        Effect.Do.pipe(
            Effect.bind("request", () => Effect.succeed(new VerboseLogRequest({ schemaName, machine }))),
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
    const [verboseLogs, fetchVerboseLogs] = useRx(verboseLogRx);
    useMemo(() => fetchVerboseLogs({ machine, schemaName }), [fetchVerboseLogs, machine, schemaName]);

    if (Result.isInitial(verboseLogs)) {
        return <p>Loading...</p>;
    }

    if (Result.isFailure(verboseLogs) || Result.isInterrupted(verboseLogs)) {
        return <p>Failed to load logs</p>;
    }

    if (!Result.isSuccess(verboseLogs)) {
        return <p>BAD</p>;
    }

    return <p>{verboseLogs.value}</p>;
}
