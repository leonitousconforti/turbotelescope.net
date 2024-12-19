import { RpcRouter } from "@effect/rpc";
import { Chunk, Layer, ManagedRuntime, Stream } from "effect";
import { NodeFileSystem } from "@effect/platform-node";
import { NextRequest } from "next/server";

import { Database } from "@/services/Database";
import { databaseRouter, verboseLogsRouter } from "@/services/rpcs";
import { VerboseLogs } from "@/services/VerboseLogs";

const router = RpcRouter.make(databaseRouter, verboseLogsRouter);
export type RpcRouter = typeof router;

const handler = RpcRouter.toHandler(router);
const runtime = ManagedRuntime.make(Layer.mergeAll(Database.Default, VerboseLogs.Default, NodeFileSystem.layer));

export async function POST(request: NextRequest) {
    const data = await request.json();
    const stream = handler(data);

    const responseStream = await Stream.toReadableStreamEffect(
        stream.pipe(
            Stream.chunks,
            Stream.map((_) => `${JSON.stringify(Chunk.toReadonlyArray(_))}\n`),
            Stream.encodeText
        )
    ).pipe(runtime.runPromise);

    return new Response(responseStream, {
        status: 200,
        headers: {
            "Transfer-Encoding": "chunked",
            "Content-Type": "application/ndjson; charset=utf-8",
        },
    });
}
