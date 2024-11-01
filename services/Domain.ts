import { DateTime, Effect, Function, Option, ParseResult, Schema } from "effect";

/** @internal */
type Tail<T extends ReadonlyArray<unknown>> = T extends
    | [infer _First, ...infer Rest]
    | readonly [infer _First, ...infer Rest]
    ? Rest
    : Array<unknown>;

/** @internal */
type Split<StrInput extends string, Delimiter extends string> = string extends StrInput | ""
    ? Array<string>
    : StrInput extends `${infer Head}${Delimiter}${infer Rest}`
      ? [Head, ...Split<Rest, Delimiter>]
      : [StrInput];

/** @internal */
const tail = <T extends ReadonlyArray<unknown>>(elements: T): Tail<T> => elements.slice(1) as Tail<T>;

/** @internal */
const splitLiteral = <StrInput extends string, Delimiter extends string>(
    strInput: StrInput,
    delimiter: Delimiter
): Split<StrInput, Delimiter> => strInput.split(delimiter) as Split<StrInput, Delimiter>;

/** Schema for database name. */
export const Database: Schema.Literal<["turbo"]> = Schema.Literal("turbo");

/** Schema for data entry. */
export class TableName extends Schema.transformOrFail(
    Schema.TemplateLiteral(
        Schema.Literal("science_turbo_production_pipeline_"),
        Schema.Number,
        Schema.Literal("_"),
        Schema.Number,
        Schema.Literal("_"),
        Schema.Number,
        Schema.Literal("_"),
        Schema.Number,
        Schema.Literal("_"),
        Schema.Number,
        Schema.Literal("_"),
        Schema.Number
    ),
    Schema.DateTimeUtcFromSelf,
    {
        encode: (utcDateTime: DateTime.Utc) => {
            const pad = (n: number, digits: number = 1): `${number}` =>
                n < 10 ** digits ? (`${"0".repeat(digits)}${n}` as `${number}`) : (`${n}` as `${number}`);

            const day = pad(DateTime.getPartUtc(utcDateTime, "day"));
            const month = pad(DateTime.getPartUtc(utcDateTime, "month"));
            const year = pad(DateTime.getPartUtc(utcDateTime, "year"), 3);
            const hours = pad(DateTime.getPartUtc(utcDateTime, "hours"));
            const minutes = pad(DateTime.getPartUtc(utcDateTime, "minutes"));
            const seconds = pad(DateTime.getPartUtc(utcDateTime, "seconds"));
            const prefix = "science_turbo_production_pipeline" as const;
            const out = `${prefix}_${month}_${day}_${year}_${hours}_${minutes}_${seconds}` as const;
            return ParseResult.succeed(out);
        },
        decode: (
            str: `science_turbo_production_pipeline_${number}_${number}_${number}_${number}_${number}_${number}`
        ): Effect.Effect<DateTime.Utc, ParseResult.ParseIssue, never> =>
            Effect.gen(function* () {
                const splitAndDropFirst4 = Function.flow(splitLiteral, tail, tail, tail, tail);
                const [monthString, dayString, yearString, hoursString, minutesString, secondsString] =
                    splitAndDropFirst4(str, "_");

                const numberToIntRangedSchema = (min: number, max: number) =>
                    Function.pipe(Schema.NumberFromString, Schema.compose(Schema.Int), Schema.between(min, max));

                const decodeToRange = (min: number, max: number) =>
                    Function.flow(
                        Schema.decode(numberToIntRangedSchema(min, max)),
                        Effect.mapError((parseError) => parseError.issue)
                    );

                const month = yield* decodeToRange(1, 12)(monthString);
                const day = yield* decodeToRange(1, 31)(dayString);
                const year = yield* decodeToRange(0, 9999)(yearString);
                const hours = yield* decodeToRange(0, 23)(hoursString);
                const minutes = yield* decodeToRange(0, 59)(minutesString);
                const seconds = yield* decodeToRange(0, 59)(secondsString);
                const maybeUtcDateTime = DateTime.make({ year, month, day, hours, minutes, seconds });

                if (Option.isSome(maybeUtcDateTime)) {
                    return maybeUtcDateTime.value;
                } else {
                    return yield* ParseResult.fail(
                        new ParseResult.Unexpected(
                            { year, month, day, hours, minutes, seconds },
                            "unexpected date time parameters"
                        )
                    );
                }
            }),
    }
) {}

export class ImageStatusTableRow extends Schema.Class<ImageStatusTableRow>("ImageStatusTableRow")({
    imageId: Schema.Number,
    pipelineStep: Schema.String,
    processingTime: Schema.Number,
    completion: Schema.String,
    date: Schema.Number,
    success: Schema.Boolean,
}) {}

export class ImagesTableRow extends Schema.Class<ImagesTableRow>("ImagesTableRow")({
    imageId: Schema.Number,
    filePath: Schema.String,
    objectId: Schema.String,
    ra: Schema.Number,
    dec: Schema.Number,
    quality: Schema.NullOr(Schema.String),
    ncoadds: Schema.NullOr(Schema.Number),
    referencePath: Schema.NullOr(Schema.String),
    referenceDistance: Schema.NullOr(Schema.Number),
}) {}

export class ResultRow extends Schema.Class<ResultRow>("ResultRow")({
    ...ImagesTableRow.fields,
    ...ImageStatusTableRow.fields,
    sourceTable: TableName.from,
}) {}

// --------------------------------------------------------
// ----------------------- RPCs ---------------------------
// --------------------------------------------------------

export class DataByDateTimeRequest extends Schema.TaggedRequest<DataByDateTimeRequest>()("DataByDateTimeRequest", {
    failure: Schema.Never,
    success: Schema.Array(ResultRow),
    payload: { dateTime: Schema.DateTimeUtc },
}) {}

export class DataInTimeRangeRequest extends Schema.TaggedRequest<DataInTimeRangeRequest>()("DataInTimeRangeRequest", {
    failure: Schema.Never,
    success: Schema.Record({ key: TableName.from, value: Schema.Array(ResultRow) }),
    payload: { from: Schema.DateTimeUtc, until: Schema.DateTimeUtc },
}) {}
