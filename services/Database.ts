import { SqlClient, SqlError, SqlResolver } from "@effect/sql";
import { PgClient } from "@effect/sql-pg";
import {
    Array,
    Config,
    ConfigError,
    DateTime,
    Effect,
    Function,
    Layer,
    ParseResult,
    Record,
    Redacted,
    Schema,
    String,
    Tuple,
} from "effect";

import { ResultRow, TableName } from "@/services/Domain";

export const PgLive: Layer.Layer<
    PgClient.PgClient | SqlClient.SqlClient,
    ConfigError.ConfigError | SqlError.SqlError,
    never
> = PgClient.layer({
    port: Config.number("DB_PORT").pipe(Config.orElse(() => Config.succeed(5432))),
    host: Config.string("DB_HOST").pipe(Config.orElse(() => Config.succeed("popcorn.spa.umn.edu"))),
    database: Config.string("DB_NAME").pipe(Config.orElse(() => Config.succeed("turbo"))),
    username: Config.string("DB_USER").pipe(Config.orElse(() => Config.succeed("turbo"))),
    password: Config.redacted("DB_PASSWORD").pipe(Config.orElse(() => Config.succeed(Redacted.make("TURBOTURBO")))),
    transformQueryNames: Config.succeed(String.camelToSnake),
    transformResultNames: Config.succeed(String.snakeToCamel),
});

const make = Effect.gen(function* () {
    const sql: SqlClient.SqlClient = yield* SqlClient.SqlClient;

    const getTableNamesInRange = (
        from: DateTime.Utc,
        until: DateTime.Utc
    ): Effect.Effect<Array<typeof TableName.Encoded>, ParseResult.ParseError | SqlError.SqlError, never> =>
        Effect.flatMap(
            sql<{ schemaName: typeof TableName.Encoded }>`
                SELECT schema_name
                FROM information_schema.schemata
                WHERE schema_name NOT LIKE 'reference%'`,
            Function.flow(
                Array.map(({ schemaName }) => schemaName),
                Array.filterMap((maybeTableName) => Schema.decodeOption(TableName)(maybeTableName)),
                Array.filter(DateTime.between({ minimum: from, maximum: until })),
                Array.sort(DateTime.Order),
                Array.map((tableName) => Schema.encode(TableName)(tableName)),
                Effect.allWith({ concurrency: "unbounded" })
            )
        );

    const getDataByTableName = SqlResolver.grouped("getDataByTableName", {
        withContext: true,
        Request: Schema.String,
        RequestGroupKey: Function.identity,
        Result: ResultRow,
        ResultGroupKey: (_) => _.sourceTable,
        execute: (ids) => {
            const unionQueries = Array.map(
                ids,
                (tableName) => `
                SELECT
                    IMAGE_STATUS.*,
                    IMAGES.*,
                    '${tableName}' as source_table
                FROM "${tableName}".image_status AS IMAGE_STATUS
                LEFT JOIN "${tableName}".images AS IMAGES
                ON IMAGE_STATUS.image_id = IMAGES.image_id`
            );

            const rows = sql.unsafe<ResultRow>(`
                WITH combined_data AS (
                    ${unionQueries.join("\n\n    UNION ALL\n")}
                )
                SELECT * FROM combined_data;`);

            return Effect.flatMap(
                Effect.map(
                    rows,
                    Array.map((row) =>
                        Effect.gen(function* () {
                            const date = yield* Schema.decode(TableName)(row.sourceTable);
                            return {
                                ...row,
                                date: DateTime.toEpochMillis(date),
                                success: row.pipelineStep === "save the image",
                            };
                        })
                    )
                ),
                Effect.all
            );
        },
    });

    const getDataByDateTime = (
        dateTime: DateTime.Utc
    ): Effect.Effect<Array<ResultRow>, SqlError.SqlError | ParseResult.ParseError, never> =>
        Effect.Do.pipe(
            Effect.bind("resolver", () => getDataByTableName),
            Effect.bind("tableName", () => Schema.encode(TableName)(dateTime)),
            Effect.flatMap(({ resolver, tableName }) => resolver.execute(tableName))
        );

    const getDataInRange = (
        from: DateTime.Utc,
        until: DateTime.Utc
    ): Effect.Effect<
        Record.ReadonlyRecord<typeof TableName.Encoded, Array<ResultRow>>,
        ParseResult.ParseError | SqlError.SqlError,
        never
    > =>
        Effect.Do.pipe(
            Effect.bind("resolver", () => getDataByTableName),
            Effect.bind("tableNamesInRange", () => getTableNamesInRange(from, until)),
            Effect.flatMap(({ resolver, tableNamesInRange }) =>
                Function.pipe(
                    tableNamesInRange,
                    Array.map((tableName) => Tuple.make(tableName, undefined)),
                    Record.fromEntries,
                    Record.map((_, tableName) => resolver.execute(tableName)),
                    Effect.allWith({ batching: true })
                )
            )
        );

    return { getDataByDateTime, getDataInRange } as const;
});

export class Database extends Effect.Service<Database>()("app/Database", {
    accessors: false,
    dependencies: [PgLive],
    effect: make,
}) {}
