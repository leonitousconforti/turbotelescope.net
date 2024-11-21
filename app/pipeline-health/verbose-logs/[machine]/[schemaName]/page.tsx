import { LogViewer } from "@/components/LogViewer";
import { SchemaName } from "@/services/Domain";

export default async function Page({
    params,
}: {
    params: Promise<{
        machine: "tlenaii" | "popcorn";
        schemaName: typeof SchemaName.Encoded;
    }>;
}) {
    const { machine, schemaName } = await params;

    return (
        <>
            <LogViewer machine={machine} schemaName={schemaName} />
        </>
    );
}
