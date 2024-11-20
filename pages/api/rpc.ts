import { RpcRouter } from "@effect/rpc";
import { Effect, Layer, ManagedRuntime } from "effect";
import type { NextApiRequest, NextApiResponse } from "next";

import { Database } from "@/services/Database";
import { databaseRouter, verboseLogsRouter } from "@/services/rpcs";
import { VerboseLogs } from "@/services/VerboseLogs";

const router = RpcRouter.make(databaseRouter, verboseLogsRouter);
export type RpcRouter = typeof router;

const handler = RpcRouter.toHandlerNoStream(router);
const runtime = ManagedRuntime.make(Layer.mergeAll(Database.Default, VerboseLogs.Default));

export default function rpc(req: NextApiRequest, res: NextApiResponse) {
    return handler(req.body).pipe(
        Effect.andThen((body) => {
            res.status(200).json(body);
        }),
        runtime.runPromise
    );
}
