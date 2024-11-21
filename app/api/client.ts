import type { RpcRouter } from "@/app/api/rpc/route";
import * as Resolver from "@effect/rpc-http/HttpRpcResolver";

// FIXME: Find way to not hardcode the URL
export const rpcClient = Resolver.makeClient<RpcRouter>("http://localhost:5001/api/rpc");
