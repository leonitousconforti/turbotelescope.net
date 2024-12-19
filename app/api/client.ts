import type { RpcRouter } from "@/app/api/route";
import * as Resolver from "@effect/rpc-http/HttpRpcResolver";

// FIXME: Find way to not hardcode the URL (bad bad bad bad bad bad bad bad bad bad)
export const rpcClient = Resolver.makeClient<RpcRouter>("http://popcorn.spa.umn.edu:5001/api");
