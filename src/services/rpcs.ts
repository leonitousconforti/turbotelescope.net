import { Rpc, RpcRouter } from "@effect/rpc";
import { Effect } from "effect";

import { Database } from "@/services/Database";
import { DataByDateTimeRequest, DataInTimeRangeRequest } from "@/services/Domain";

export const databaseRouter = RpcRouter.make(
    Rpc.effect(DataByDateTimeRequest, ({ dateTime }) =>
        Effect.flatMap(Database, (db) => db.getDataByDateTime(dateTime)).pipe(Effect.orDie)
    ),
    Rpc.effect(DataInTimeRangeRequest, ({ from, until }) =>
        Effect.flatMap(Database, (db) => db.getDataInRange(from, until)).pipe(Effect.orDie)
    )
);
