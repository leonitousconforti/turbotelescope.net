import type { RpcRouter } from "@/app/api/route";
import * as Resolver from "@effect/rpc-http/HttpRpcResolver";

// FIXME: Find way to not hardcode the URL
export const rpcClient = Resolver.makeClient<RpcRouter>("http://localhost:5001/api");
