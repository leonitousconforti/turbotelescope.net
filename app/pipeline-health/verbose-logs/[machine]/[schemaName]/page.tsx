import dynamic from "next/dynamic";

import { LogViewer } from "@/components/LogViewer";
import { SchemaName } from "@/services/Domain";

const page = ({
    params,
}: {
    params: {
        machine: "tlenaii" | "popcorn";
        schemaName: typeof SchemaName.Encoded;
    };
}) => {
    return (
        <>
            <LogViewer machine={params.machine} schemaName={params.schemaName} />
        </>
    );
};

// FIXME: bad bad bad bad bad
export default dynamic(() => Promise.resolve(page), { ssr: false });
