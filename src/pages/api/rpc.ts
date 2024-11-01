import { RpcRouter } from "@effect/rpc";
import { Effect, Layer, ManagedRuntime } from "effect";
import type { NextApiRequest, NextApiResponse } from "next";

import { Database } from "@/services/Database";
import { databaseRouter } from "@/services/rpcs";

const router = RpcRouter.make(databaseRouter);

export type RpcRouter = typeof router;

const runtime = ManagedRuntime.make(Layer.mergeAll(Database.Default));
const handler = RpcRouter.toHandlerNoStream(router);

export default function rpc(req: NextApiRequest, res: NextApiResponse) {
    return handler(req.body).pipe(
        Effect.andThen((body) => {
            res.status(200).json(body);
        }),
        runtime.runPromise
    );
}
