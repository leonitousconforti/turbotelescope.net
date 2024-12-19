import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Function } from "effect";
import { splitLiteral, tail, SchemaName } from "@/services/Domain";

const popcornServer = "http://popcorn-logs.turbotelescope.net:54321";
const tlenaiiServer = "http://tlenaii-logs.turbotelescope.net:54322";

export const cn = (...inputs: ReadonlyArray<ClassValue>) => twMerge(clsx(inputs));

export const getLogURL = (schemaName: typeof SchemaName.from.Type, machine: "tlenaii" | "popcorn"): string => {
    const splitAndDropFirst4 = Function.flow(splitLiteral, tail, tail, tail, tail);
    const [monthString, dayString, yearString, hoursString, minutesString, secondsString] = splitAndDropFirst4(
        schemaName,
        "_"
    );

    const timeParts =
        `${yearString}_${monthString}_${dayString}_${hoursString}_${minutesString}_${secondsString}` as const;

    const server = machine === "tlenaii" ? tlenaiiServer : popcornServer;
    const location = `Light_weight_pipeline_${timeParts}` as const;

    return server + "/" + location + "/" + "verbose_log.txt";
};

export const getSciURL = (filePath: string): string => {
    const start = filePath.indexOf("telescope_");
    const end = filePath.lastIndexOf(".fits");

    if (start !== -1 && end !== -1 && end > start) {
        const ImgName = filePath.substring(start + "telescope_".length, end);
        return "http://popcorn.spa.umn.edu/center_cutouts/sci_cutouts/centcut_telescope_" + ImgName + ".webp";
    } else {
        return "http://popcorn.spa.umn.edu/center_cutouts/sci_cutouts/error";
    }
};

export const getDiffURL = (filePath: string): string => {
    const start = filePath.indexOf("telescope_");
    const end = filePath.lastIndexOf(".fits");

    if (start !== -1 && end !== -1 && end > start) {
        const ImgName = filePath.substring(start + "telescope_".length, end);
        return "http://popcorn.spa.umn.edu/center_cutouts/diff_cutouts/diff_centcut_telescope_" + ImgName + ".webp";
    } else {
        return "http://popcorn.spa.umn.edu/center_cutouts/sci_cutouts/error";
    }
};

//M82 ref is differnt from all other ref types.pipe(
//others: "name_number", i.e. IC_1613"
//M82: "M82"
export const getRefURL = (
    filePath:
        | `${string}telescope_g_${string}_${string}_${number}_${string}.fits`
        | `${string}telescope_r_${string}_${string}_${number}_${string}.fits`
): string => {
    const test = splitLiteral(filePath, "telescope_")[1];
    const [redOrGreen, a, b] = splitLiteral(test, "_");
    if (b == "2025" || b == "2024") {
        return (
            "http://popcorn.spa.umn.edu/center_cutouts/ref_cutouts/ref_centcut_telescope_" +
            redOrGreen +
            "_" +
            a +
            ".webp"
        );
    }
    return (
        "http://popcorn.spa.umn.edu/center_cutouts/ref_cutouts/ref_centcut_telescope_" +
        redOrGreen +
        "_" +
        a +
        b +
        ".webp"
    );
};
