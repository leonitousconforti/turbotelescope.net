import { Rpc, RpcRouter } from "@effect/rpc";
import { Effect } from "effect";

import { Database } from "@/services/Database";
import { RunsInTimeRangeRequest, VerboseLogRequest } from "@/services/Domain";
import { VerboseLogs } from "@/services/VerboseLogs";

export const databaseRouter = RpcRouter.make(
    Rpc.effect(RunsInTimeRangeRequest, ({ from, until }) =>
        Effect.flatMap(Database, (database) => database.getDataInRange(from, until)).pipe(Effect.orDie)
    )
);

export const verboseLogsRouter = RpcRouter.make(
    Rpc.effect(VerboseLogRequest, ({ machine, schemaName }) =>
        Effect.flatMap(VerboseLogs, (verboseLogs) => verboseLogs.fetchLog(schemaName, machine)).pipe(Effect.orDie)
    )
);
