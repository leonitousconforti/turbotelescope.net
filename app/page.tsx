import { AverageProcessingTime } from "@/components/graphs/AverageProcessingTime";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
    return (
        <div>
            <ThemeToggle />
            <AverageProcessingTime />
        </div>
    );
}
