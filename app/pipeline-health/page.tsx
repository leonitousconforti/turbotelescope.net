import { PipelineHealth } from "@/components/PipelineHealth";
import { ThemeToggle } from "@/components/ThemeToggle";
import dynamic from "next/dynamic";

const page = () => {
    return (
        <>
            <div className="fixed bottom-5 right-5 z-50">
                <ThemeToggle />
            </div>
            <PipelineHealth />
        </>
    );
};

// FIXME: bad bad bad bad bad
export default dynamic(() => Promise.resolve(page), { ssr: false });
