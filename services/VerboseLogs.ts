import { FetchHttpClient, HttpClient, HttpClientError, HttpClientRequest } from "@effect/platform";
import { Effect, Function } from "effect";

import { SchemaName, splitLiteral, tail } from "@/services/Domain";

const popcornServer = "http://popcorn-logs.turbotelescope.net:54321";
const tlenaiiServer = "http://tlenaii-logs.turbotelescope.net:54322";

const make = Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;

    /**
     * Logs will either be in
     *
     * "/home/tlenaii/pipeline_work/pipeline/logging_folder/Light_weight_pipeline_"
     * "/mnt/14tb_turbo_disk/users/mssgill/pipeline/logging_folder/Light_weight_pipeline_"
     */
    const fetchLog = (
        schemaName: typeof SchemaName.from.Type,
        machine: "tlenaii" | "popcorn"
    ): Effect.Effect<string, HttpClientError.HttpClientError, never> => {
        const splitAndDropFirst4 = Function.flow(splitLiteral, tail, tail, tail, tail);
        const [monthString, dayString, yearString, hoursString, minutesString, secondsString] = splitAndDropFirst4(
            schemaName,
            "_"
        );

        const timeParts =
            `${monthString}_${dayString}_${yearString}_${hoursString}_${minutesString}_${secondsString}` as const;

        const server = machine === "tlenaii" ? tlenaiiServer : popcornServer;
        const location = `Light_weight_pipeline_${timeParts}` as const;

        return Function.pipe(
            HttpClientRequest.get(server + "/" + location + "/" + "verbose_log.txt"),
            client.execute,
            Effect.flatMap(({ text }) => text),
            Effect.scoped
        );
    };

    return { fetchLog } as const;
});

export class VerboseLogs extends Effect.Service<VerboseLogs>()("app/VerboseLogs", {
    accessors: false,
    dependencies: [FetchHttpClient.layer],
    effect: make,
}) {}
