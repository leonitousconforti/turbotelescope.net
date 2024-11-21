import { PipelineHealth } from "@/components/PipelineHealth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Page() {
    return (
        <>
            <div className="fixed bottom-5 right-5 z-50">
                <ThemeToggle />
            </div>
            <PipelineHealth />
        </>
    );
}
