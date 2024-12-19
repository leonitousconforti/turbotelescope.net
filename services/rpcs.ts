import { Rpc, RpcRouter } from "@effect/rpc";
import { Effect, Function, Stream } from "effect";

import { Database } from "@/services/Database";
import {
    RunsInTimeRangeRequest,
    SubscribeToRunsRequest,
    VerboseLogRequest,
    VerboseLogURLRequest,
} from "@/services/Domain";
import { VerboseLogs } from "@/services/VerboseLogs";

export const databaseRouter = RpcRouter.make(
    Rpc.effect(RunsInTimeRangeRequest, ({ from, until }) =>
        Effect.flatMap(Database, (database) => database.getDataInRange(from, until)).pipe(Effect.orDie)
    ),
    Rpc.stream(SubscribeToRunsRequest, ({ refreshInterval }) =>
        Function.pipe(
            Effect.map(Database, (database) => database.subscribeToDataInRange(refreshInterval)),
            Stream.unwrap,
            Stream.orDie
        )
    )
);

export const verboseLogsRouter = RpcRouter.make(
    Rpc.stream(VerboseLogRequest, ({ machine, schemaName }) =>
        Function.pipe(
            Effect.map(VerboseLogs, (verboseLogs) => verboseLogs.fetchLog(schemaName, machine)),
            Stream.unwrap,
            Stream.orDie
        )
    ),
    Rpc.effect(VerboseLogURLRequest, ({ machine, schemaName }) =>
        Function.pipe(
            Effect.flatMap(VerboseLogs, (verboseLogs) => verboseLogs.getLogURL(schemaName, machine)),
            Effect.orDie
        )
    )
);
